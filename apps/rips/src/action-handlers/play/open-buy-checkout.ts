import {
	ripsControllerQuotePurchase,
	usersControllerGetUser,
} from '../../../generated/api-client'
import { ActionDef, withPayload } from '../../action-def'
import { NATIVE_ON_BASE } from '../../constants'
import { BuyCheckoutPage } from '../../pages/play/buy-checkout-page'
import { EffectType } from '../../types'
import { fetchNativeBalance, fetchStake } from '../../utils/api'
import { assertFlow, setFlowStep } from '../../utils/session-utils'
import { resolveConfig } from '../../utils/stake'
import { evmAddressFromUser } from '../../utils/wallet'
import { parseTicketCount } from '../../validation/ticket-count'

export const openBuyCheckout: ActionDef<number> = withPayload(
	(ticketCount) => ticketCount.toString(),
	(raw) => parseTicketCount(raw),
	async (session, ticketCount) => {
		assertFlow(session, 'buyTickets', 'stake-chosen', 'ticket-count-chosen')
		const { stakeId } = session.flow.data

		const [
			{ data: user },
			availableStake,
			nativeBalance,
			{ data: purchaseQuote },
		] = await Promise.all([
			usersControllerGetUser({
				path: { telegramId: session.telegramId },
			}),
			fetchStake(stakeId),
			fetchNativeBalance(session.telegramId),
			ripsControllerQuotePurchase({
				body: {
					paymentCurrencyChainAddress: NATIVE_ON_BASE,
					stakeId,
					ticketCount,
				},
			}),
		])

		const config = resolveConfig(availableStake)
		const totalCost =
			BigInt(config.ticketPrice.amount) * BigInt(ticketCount)

		const currencyInAmount = {
			amount: totalCost.toString(),
			currency: nativeBalance.currency,
		}

		setFlowStep(session, 'ticket-count-chosen', { stakeId, ticketCount })

		return {
			type: EffectType.EDIT,
			page: BuyCheckoutPage.render({
				availableStake,
				ticketCount,
				currencyInAmount,
				purchaseQuote,
				nativeBalance,
				currencyInBalance: nativeBalance,
				userEvmAddress: evmAddressFromUser(user),
			}),
		}
	},
)
