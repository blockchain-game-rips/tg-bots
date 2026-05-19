import { setFlow } from '@rips/grammy-kit'
import { ActionDef, withPayload } from '../../action-def'
import { BuyChooseTicketCountPage } from '../../pages/play/buy-choose-ticket-count-page'
import { EffectType } from '../../types'
import { fetchStake } from '../../utils/api/wrappers'
import { parseStakeId } from '../../validation/stake-id'

export const openBuyChooseTicketCount: ActionDef<number> = withPayload(
	(stakeId) => stakeId.toString(),
	(raw) => parseStakeId(raw),
	async (session, stakeId) => {
		const availableStake = await fetchStake(stakeId)

		setFlow(session, 'buyTickets', 'stake-chosen', { stakeId })

		return {
			type: EffectType.EDIT,
			page: BuyChooseTicketCountPage.render(availableStake),
		}
	},
)
