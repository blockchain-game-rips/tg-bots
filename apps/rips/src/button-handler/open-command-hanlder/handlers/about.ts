import { Filter } from 'grammy'
import { AboutPage } from '../../../pages/content/about-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handleAboutPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	const aboutPage = AboutPage.render()

	await editMessage(ctx, aboutPage)
}
