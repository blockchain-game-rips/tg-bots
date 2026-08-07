import { ripsControllerQuotePurchase } from '@rips/api-client'
import { assertFlow } from '@rips/grammy-kit'
import { parseEntryCount, resolveConfig } from '@rips/shared'
import { ActionDef, withPayload } from '../../../action-def'
import { NATIVE_ON_BASE } from '../../../constants'
import { toStep } from '../../../flows'
import { CheckoutPage } from '../../../pages/play/checkout-page'
import { EffectType } from '../../../types'
import { fetchNativeBalance } from '../../../utils/api/wrappers'

export const openEnterCheckout: ActionDef<number> = withPayload(
	{
		encode: (entryCount) => entryCount.toString(),
		decode: (raw) => parseEntryCount(raw),
	},
	async (session, entryCount) => {
		assertFlow(
			session,
			'enter',
			'choosing-entry-count',
			'choosing-payment-token',
			'at-checkout',
		)

		const { availablePreset } = session.flow.data
		const presetId = availablePreset.preset.id

		const [nativeBalance, { data: purchaseQuote }] = await Promise.all([
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
			currency: config.entryPrice.currency,
		}

		const flow = toStep(session.flow, 'at-checkout', {
			availablePreset,
			entryCount,
			balances: [nativeBalance],
			payCurrencyBalance: nativeBalance,
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
