import { Filter } from 'grammy'
import { getStakes } from '../../../api/endpoints/rips'
import { AboutPage } from '../../../pages/content/about-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handleAboutPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	const stakes = await getStakes()
	const aboutPage = AboutPage.render(stakes)

	await editMessage(ctx, aboutPage)
}
