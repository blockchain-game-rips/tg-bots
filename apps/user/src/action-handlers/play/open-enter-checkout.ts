import { ripsControllerQuotePurchase } from '@rips/api-client'
import { assertFlow } from '@rips/grammy-kit'
import { parseEntryCount, resolveConfig } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { NATIVE_ON_BASE } from '../../constants'
import { toStep } from '../../flows'
import { CheckoutPage } from '../../pages/play/checkout-page'
import { EffectType } from '../../types'
import { fetchNativeBalance, fetchPreset } from '../../utils/api/wrappers'

export const openEnterCheckout: ActionDef<number> = withPayload(
	{
		encode: (entryCount) => entryCount.toString(),
		decode: (raw) => parseEntryCount(raw),
	},
	async (session, entryCount) => {
		assertFlow(session, 'enter', 'preset-chosen', 'entry-count-chosen')
		const { presetId } = session.flow.data

		const [availablePreset, nativeBalance, { data: purchaseQuote }] =
			await Promise.all([
				fetchPreset(presetId),
				fetchNativeBalance(session.telegramId),
				ripsControllerQuotePurchase({
					body: {
						paymentCurrencyChainAddress: NATIVE_ON_BASE,
						presetId,
						entryCount,
					},
				}),
			])

		const config = resolveConfig(availablePreset)
		const totalCost = BigInt(config.entryPrice.amount) * BigInt(entryCount)

		const entryTotal = {
			amount: totalCost.toString(),
			currency: nativeBalance.currency,
		}

		const flow = toStep(session.flow, 'entry-count-chosen', {
			presetId,
			entryCount,
		})

		return {
			flow,
			effect: {
				type: EffectType.EDIT,
				page: CheckoutPage.render({
					availablePreset,
					entryCount,
					srcBalance: nativeBalance,
					nativeBalance,
					quote: {
						kind: 'direct',
						amountIn: entryTotal,
						quote: purchaseQuote,
					},
				}),
			},
		}
	},
)
