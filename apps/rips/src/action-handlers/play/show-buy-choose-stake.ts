import { ripsControllerGetStakes } from '../../../generated/api-client'
import { BuyChooseStakePage } from '../../pages/play/buy-choose-stake-page'
import { Effect, EffectType, SessionData } from '../../types'

export async function showBuyChooseStake(
	_session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const { data } = await ripsControllerGetStakes()

	return {
		type: EffectType.EDIT,
		page: BuyChooseStakePage.render(data.availableStakes),
	}
}
