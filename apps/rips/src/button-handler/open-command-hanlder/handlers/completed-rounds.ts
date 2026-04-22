import { Filter } from 'grammy'
import { ripsControllerGetCompletedRounds } from '../../../../generated/api-client'
import { FinishedRoundsPage } from '../../../pages/content/finished-rounds-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handleCompletedRoundsPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	const { data } = await ripsControllerGetCompletedRounds({
		throwOnError: true,
	})

	await editMessage(ctx, FinishedRoundsPage.render(data.rounds))
}
