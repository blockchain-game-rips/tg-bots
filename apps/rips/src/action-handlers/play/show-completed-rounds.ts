import { ripsControllerGetCompletedRounds } from '../../../generated/api-client'
import { FinishedRoundsPage } from '../../pages/content/play/finished-rounds-page'
import { Effect, EffectType, SessionData } from '../../types'

export async function showCompletedRounds(
	_session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const { data } = await ripsControllerGetCompletedRounds()

	return {
		type: EffectType.EDIT,
		page: FinishedRoundsPage.render(data.rounds),
	}
}
