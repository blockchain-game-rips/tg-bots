import { Filter } from 'grammy'
import { AboutPage } from '../../../pages/content/about-page'
import { Context } from '../../../types'
import { editMessage } from '../../../utils/grammy'

export async function handleAboutPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	const aboutPage = AboutPage.render()

	await editMessage(ctx, aboutPage)
}
