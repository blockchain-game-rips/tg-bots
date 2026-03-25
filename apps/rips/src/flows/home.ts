import { ApiError } from '../api/client'
import { createUser, getUser } from '../api/endpoints/users'
import { HomePage } from '../pages/content/home-page'
import { Context, PageContent } from '../types'

const NOT_FOUND_STATUS = 404

export async function enterHomeFlow(ctx: Context): Promise<PageContent> {
	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = BigInt(ctx.from.id)

	await getUser(telegramId).catch(async (error) => {
		if (error instanceof ApiError && error.status === NOT_FOUND_STATUS) {
			return await createUser(telegramId)
		}

		throw error
	})

	return HomePage.render()
}
