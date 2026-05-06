import { ripsControllerGetStakes } from '../../../generated/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { BuyChooseStakePage } from '../../pages/play/buy-choose-stake-page'
import { EffectType } from '../../types'

export const openBuyChooseStake: ActionDef<void> = noPayload(async () => {
	const { data } = await ripsControllerGetStakes()

	return {
		type: EffectType.EDIT,
		page: BuyChooseStakePage.render(data.availableStakes),
	}
})
