import { Filter } from 'grammy'
import { ripsControllerGetStakes } from '../../../../generated/api-client'
import { AboutPage } from '../../../pages/content/about/about-page'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handleAboutPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	const { data } = await ripsControllerGetStakes({ throwOnError: true })

	const configs = data.availableStakes
		.map((s) => s.fillingRound?.config ?? s.stake.currentConfig)
		.filter((c) => c !== null && c !== undefined)

	await editMessage(ctx, AboutPage.render(configs))
}
