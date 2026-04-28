import { ripsControllerGetStakes } from '../../../generated/api-client'
import { BuyChooseStakePage } from '../../pages/content/play/buy-choose-stake-page'
import { Effect, EffectType, SessionData } from '../../types'

export async function showChooseStake(
	_session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const { data } = await ripsControllerGetStakes({ throwOnError: true })

	return {
		type: EffectType.EDIT,
		page: BuyChooseStakePage.render(data.availableStakes),
	}
}
