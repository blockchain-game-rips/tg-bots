import { Filter } from 'grammy'
import { enterHomeFlow } from '../../../flows/home'
import { Context } from '../../../types'
import { editMessage } from '../../../utils/grammy'

export async function handleHomePageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	const homePage = await enterHomeFlow(ctx)

	await editMessage(ctx, homePage)
}
