import { ConfirmPage } from '../pages/confirm-page'
import { getFlowData } from '../session-utils'
import { Effect, EffectType, SessionData } from '../types'
import { parseTicketCount } from '../validation/ticket-count'

export function showConfirm(
	session: SessionData,
	payload: string | undefined,
): Effect {
	const ticketCount = parseTicketCount(payload)

	const { stakeId } = getFlowData(session, 'buyTickets', 'stake-chosen')

	session.flow = {
		flowType: 'buyTickets',
		step: 'stake-ticket-count-chosen',
		data: { stakeId, ticketCount },
	}

	return {
		type: EffectType.EDIT,
		page: ConfirmPage.render(stakeId, ticketCount),
	}
}
