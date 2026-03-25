import { Filter } from 'grammy'
import { enterHomeFlow } from '../../../flows/home'
import { Context } from '../../../types'
import { clearFlow, editMessage } from '../../../utils/grammy'

export async function handleHomePageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	clearFlow(ctx)

	const homePage = await enterHomeFlow(ctx)

	await editMessage(ctx, homePage)
}
