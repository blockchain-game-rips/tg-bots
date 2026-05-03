import { ZapChooseChainPage } from '../../pages/play/zap-choose-chain-page'
import { Effect, EffectType, SessionData } from '../../types'
import { fetchStake } from '../../utils/api'
import { assertFlow } from '../../utils/session-utils'

export async function openZapChooseChain(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	assertFlow(session, 'buyTickets', 'ticket-count-chosen')

	const { stakeId, ticketCount } = session.flow.data

	const availableStake = await fetchStake(stakeId)

	return {
		type: EffectType.EDIT,
		page: ZapChooseChainPage.render({ availableStake, ticketCount }),
	}
}
