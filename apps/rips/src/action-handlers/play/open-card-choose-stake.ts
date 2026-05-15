import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { CardCollectionChooseStakePage } from '../../pages/play/card-collection-choose-stake'
import { EffectType } from '../../types'
import { fetchStakes } from '../../utils/api/wrappers'

export const openCardChooseStake: ActionDef<void> = noPayload(async () => {
	const availableStakes = await fetchStakes()

	return {
		type: EffectType.EDIT,
		page: CardCollectionChooseStakePage.render(availableStakes),
	}
})
