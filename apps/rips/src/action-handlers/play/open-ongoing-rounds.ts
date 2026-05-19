import {
	ripsControllerGetOngoingRounds,
	ripsControllerGetStakes,
} from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { OngoingRoundsPage } from '../../pages/play/ongoing-rounds-page'
import { EffectType } from '../../types'

export const openOngoingRounds: ActionDef<void> = noPayload(async () => {
	const [{ data: roundsData }, { data: stakesData }] = await Promise.all([
		ripsControllerGetOngoingRounds(),
		ripsControllerGetStakes(),
	])

	return {
		type: EffectType.EDIT,
		page: OngoingRoundsPage.render(
			roundsData.rounds,
			stakesData.availableStakes,
		),
	}
})
