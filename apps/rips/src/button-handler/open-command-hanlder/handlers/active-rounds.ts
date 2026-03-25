import { Filter } from 'grammy'
import { getRounds } from '../../../api/endpoints/rips'
import { ActiveRoundsPage } from '../../../pages/content/active-rounds-page'
import { Context } from '../../../types'
import { editMessage } from '../../../utils/grammy'

export async function handleActiveRoundsPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	const rounds = await getRounds()
	const activeRoundsPage = ActiveRoundsPage.render(rounds)

	await editMessage(ctx, activeRoundsPage)
}
