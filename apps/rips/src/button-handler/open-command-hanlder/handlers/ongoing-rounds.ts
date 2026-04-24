import { Filter } from 'grammy'
import {
	ripsControllerGetOngoingRounds,
	ripsControllerGetStakes,
} from '../../../../generated/api-client'
import { OngoingRoundsPage } from '../../../pages/content/play/ongoing-rounds-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handleOngoingRoundsPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	const [{ data: roundsData }, { data: stakesData }] = await Promise.all([
		ripsControllerGetOngoingRounds({ throwOnError: true }),
		ripsControllerGetStakes({ throwOnError: true }),
	])

	await editMessage(
		ctx,
		OngoingRoundsPage.render(roundsData.rounds, stakesData.availableStakes),
	)
}
