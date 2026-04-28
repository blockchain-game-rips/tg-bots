import {
	ripsControllerBuyTicketsPurchase,
	ripsControllerGetOngoingRounds,
} from '../../../generated/api-client'
import { NATIVE_ON_BASE } from '../../constants'
import { BuySuccessPage } from '../../pages/content/play/buy-success-page'
import { getFlowData } from '../../session-utils'
import { Effect, EffectType, SessionData } from '../../types'
import { isApiErrorWithStatus } from '../../utils/action-handler-utils'
import { ErrorToRender } from '../../utils/error-to-render'

const TRANSACTION_REVERTED_STATUS = 502

export async function buyTickets(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const { stakeId, ticketCount } = getFlowData(
		session,
		'buyTickets',
		'ticket-count-chosen',
	)

	const { data: purchase } = await ripsControllerBuyTicketsPurchase({
		headers: { 'x-telegram-id': session.telegramId },
		body: {
			stakeId,
			ticketCount,
			paymentCurrencyChainAddress: NATIVE_ON_BASE,
		},
	}).catch((error: unknown) => {
		if (isApiErrorWithStatus(error, TRANSACTION_REVERTED_STATUS)) {
			throw new ErrorToRender(error.message)
		}

		throw error
	})

	const { data: roundsData } = await ripsControllerGetOngoingRounds()

	const round = roundsData.rounds.find((r) => r.id === purchase.roundId)

	session.flow = null

	return {
		type: EffectType.EDIT,
		page: BuySuccessPage.render(purchase, round),
	}
}
