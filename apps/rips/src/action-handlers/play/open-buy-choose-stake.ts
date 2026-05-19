import { ActionDef, noPayload } from '../../action-def'
import { BuyChooseStakePage } from '../../pages/play/buy-choose-stake-page'
import { EffectType } from '../../types'
import { fetchStakes } from '../../utils/api/wrappers'

export const openBuyChooseStake: ActionDef<void> = noPayload(async () => {
	const availableStakes = await fetchStakes()

	return {
		type: EffectType.EDIT,
		page: BuyChooseStakePage.render(availableStakes),
	}
})
