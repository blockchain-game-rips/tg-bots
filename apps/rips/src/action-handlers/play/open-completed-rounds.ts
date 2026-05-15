import { ripsControllerGetCompletedRounds } from '../../../generated/api-client'
import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { FinishedRoundsPage } from '../../pages/play/finished-rounds-page'
import { EffectType } from '../../types'

export const openCompletedRounds: ActionDef<void> = noPayload(async () => {
	const { data } = await ripsControllerGetCompletedRounds()

	return {
		type: EffectType.EDIT,
		page: FinishedRoundsPage.render(data.rounds),
	}
})
