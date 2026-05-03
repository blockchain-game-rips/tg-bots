import { ripsControllerGetStakes } from '../../../generated/api-client'
import { CardCollectionChooseStakePage } from '../../pages/play/card-collection-choose-stake'
import { Effect, EffectType, SessionData } from '../../types'

export async function openCardChooseStake(
	_session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const { data } = await ripsControllerGetStakes()

	return {
		type: EffectType.EDIT,
		page: CardCollectionChooseStakePage.render(data.availableStakes),
	}
}
