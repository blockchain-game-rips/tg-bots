import { ripsControllerGetStakes } from '../../../generated/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { CardCollectionChooseStakePage } from '../../pages/play/card-collection-choose-stake'
import { EffectType } from '../../types'

export const openCardChooseStake: ActionDef<void> = noPayload(async () => {
	const { data } = await ripsControllerGetStakes()

	return {
		type: EffectType.EDIT,
		page: CardCollectionChooseStakePage.render(data.availableStakes),
	}
})
