import { ripsControllerQuotePurchase } from '../../../generated/api-client'
import { NATIVE_ON_BASE } from '../../constants'
import { BuyCheckoutPage } from '../../pages/content/play/buy-checkout-page'
import { resolveConfig } from '../../pages/utils'
import { Effect, EffectType, SessionData } from '../../types'
import { assertFlow, setFlowStep } from '../../utils/session-utils'
import { fetchNativeBalance, fetchStake } from '../../utils/units'
import { parseTicketCount } from '../../validation/ticket-count'

export async function showBuyCheckout(
	session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	const ticketCount = parseTicketCount(payload)

	assertFlow(session, 'buyTickets', 'stake-chosen')
	const { stakeId } = session.flow.data

	setFlowStep(session, 'ticket-count-chosen', { stakeId, ticketCount })

	const [availableStake, nativeBalance, { data: purchaseQuote }] =
		await Promise.all([
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
	const totalCost = BigInt(config.ticketPrice.amount) * BigInt(ticketCount)

	const currencyInAmount: typeof nativeBalance = {
		amount: totalCost.toString(),
		currency: nativeBalance.currency,
	}

	return {
		type: EffectType.EDIT,
		page: BuyCheckoutPage.render({
			availableStake,
			ticketCount,
			currencyInAmount,
			purchaseQuote,
			nativeBalance,
			currencyInBalance: nativeBalance,
		}),
	}
}
