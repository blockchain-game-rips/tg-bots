import { ripsControllerGetStakes } from '../../../generated/api-client'
import { BuyChooseTicketCountPage } from '../../pages/content/play/buy-choose-ticket-count-page'
import { Effect, EffectType, SessionData } from '../../types'
import { ErrorToRender } from '../../utils/error-to-render'
import { parseStakeId } from '../../validation/stake-id'

export async function showChooseTicketAmount(
	session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	const stakeId = parseStakeId(payload)

	const { data } = await ripsControllerGetStakes()
	const availableStake = data.availableStakes.find(
		(s) => s.stake.id === stakeId,
	)

	if (availableStake === undefined) {
		throw new ErrorToRender('Stake not found')
	}

	session.flow = {
		flowType: 'buyTickets',
		step: 'stake-chosen',
		data: { stakeId },
	}

	return {
		type: EffectType.EDIT,
		page: BuyChooseTicketCountPage.render(availableStake),
	}
}
