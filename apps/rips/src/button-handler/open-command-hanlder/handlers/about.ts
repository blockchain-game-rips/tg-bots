import { Filter } from 'grammy'
import { getMainCurrencyPrice } from '../../../api/endpoints/price'
import { getStakes } from '../../../api/endpoints/rips'
import { AboutPage } from '../../../pages/content/about-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handleAboutPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	const [stakes, { price }] = await Promise.all([
		getStakes(),
		getMainCurrencyPrice(),
	])
	const aboutPage = AboutPage.render(stakes, price)

	await editMessage(ctx, aboutPage)
}
