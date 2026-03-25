import { Filter } from 'grammy'
import { getRounds } from '../../../api/endpoints/rips'
import { ActiveRoundsPage } from '../../../pages/content/active-rounds-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handleOngoingRoundsPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	const rounds = await getRounds()
	const ongoingRoundsPage = ActiveRoundsPage.render(rounds)

	await editMessage(ctx, ongoingRoundsPage)
}
