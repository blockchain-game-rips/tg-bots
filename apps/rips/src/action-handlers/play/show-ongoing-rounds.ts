import {
	ripsControllerGetOngoingRounds,
	ripsControllerGetStakes,
} from '../../../generated/api-client'
import { OngoingRoundsPage } from '../../pages/content/play/ongoing-rounds-page'
import { Effect, EffectType, SessionData } from '../../types'

export async function showOngoingRounds(
	_session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const [{ data: roundsData }, { data: stakesData }] = await Promise.all([
		ripsControllerGetOngoingRounds({ throwOnError: true }),
		ripsControllerGetStakes({ throwOnError: true }),
	])

	return {
		type: EffectType.EDIT,
		page: OngoingRoundsPage.render(
			roundsData.rounds,
			stakesData.availableStakes,
		),
	}
}
