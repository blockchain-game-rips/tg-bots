import { ripsControllerGetStakes } from '../../../generated/api-client'
import { CardCollectionChooseStakePage } from '../../pages/content/play/card-collection-choose-stake'
import { Effect, EffectType, SessionData } from '../../types'

export async function showCardChooseStake(
	_session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const { data } = await ripsControllerGetStakes()

	return {
		type: EffectType.EDIT,
		page: CardCollectionChooseStakePage.render(data.availableStakes),
	}
}
