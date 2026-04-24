import { Filter } from 'grammy'
import { PlayPage } from '../../../pages/content/play/play-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handlePlayPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	await editMessage(ctx, PlayPage.render())
}
