import { BuyChooseTicketCountPage } from '../../pages/content/play/buy-choose-ticket-count-page'
import { Effect, EffectType, SessionData } from '../../types'
import { setFlow } from '../../utils/session-utils'
import { fetchStake } from '../../utils/units'
import { parseStakeId } from '../../validation/stake-id'

export async function showChooseTicketCount(
	session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	const stakeId = parseStakeId(payload)

	const availableStake = await fetchStake(stakeId)

	setFlow(session, 'buyTickets', 'stake-chosen', { stakeId })

	return {
		type: EffectType.EDIT,
		page: BuyChooseTicketCountPage.render(availableStake),
	}
}
