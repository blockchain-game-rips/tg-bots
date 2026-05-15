import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { assertFlow } from '../../grammy-kit/session/session-utils'
import { ZapChooseChainPage } from '../../pages/play/zap-choose-chain-page'
import { EffectType } from '../../types'
import { fetchStake } from '../../utils/api/wrappers'

export const openZapChooseChain: ActionDef<void> = noPayload(
	async (session) => {
		assertFlow(session, 'buyTickets', 'ticket-count-chosen')

		const { stakeId, ticketCount } = session.flow.data

		const availableStake = await fetchStake(stakeId)

		return {
			type: EffectType.EDIT,
			page: ZapChooseChainPage.render({ availableStake, ticketCount }),
		}
	},
)
