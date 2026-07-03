import {
	ripsControllerQuotePurchase,
	usersControllerGetUser,
} from '@rips/api-client'
import { assertFlow, toStep } from '@rips/grammy-kit'
import { parseEntryCount, resolveConfig } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { NATIVE_ON_BASE } from '../../constants'
import { BuyCheckoutPage } from '../../pages/play/buy-checkout-page'
import { EffectType } from '../../types'
import { fetchNativeBalance, fetchPreset } from '../../utils/api/wrappers'
import { evmAddressFromUser } from '../../utils/wallet'

export const openBuyCheckout: ActionDef<number> = withPayload(
	(entryCount) => entryCount.toString(),
	(raw) => parseEntryCount(raw),
	async (session, entryCount) => {
		assertFlow(session, 'buyEntries', 'preset-chosen', 'entry-count-chosen')
		const { presetId } = session.flow.data

		const [
			{ data: user },
			availablePreset,
			nativeBalance,
			{ data: purchaseQuote },
		] = await Promise.all([
			usersControllerGetUser({
				path: { telegramId: session.telegramId },
			}),
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

		const currencyInAmount = {
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
				page: BuyCheckoutPage.render({
					availablePreset,
					entryCount,
					currencyInAmount,
					purchaseQuote,
					nativeBalance,
					currencyInBalance: nativeBalance,
					userEvmAddress: evmAddressFromUser(user),
				}),
			},
		}
	},
)
