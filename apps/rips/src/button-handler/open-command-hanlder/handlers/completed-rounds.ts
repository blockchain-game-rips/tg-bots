import { Filter } from 'grammy'
import { getRounds } from '../../../api/endpoints/rips'
import { FinishedRoundsPage } from '../../../pages/content/finished-rounds-page'
import { Context } from '../../../types'
import { editMessage } from '../../../utils/grammy'

export async function handleCompletedRoundsPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	const rounds = await getRounds()
	const completedRoundsPage = FinishedRoundsPage.render(rounds)

	await editMessage(ctx, completedRoundsPage)
}
