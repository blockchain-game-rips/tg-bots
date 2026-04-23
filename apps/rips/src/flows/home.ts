import {
	usersControllerCreateUser,
	usersControllerGetUser,
} from '../../generated/api-client'
import { HomePage } from '../pages/content/home-page'
import { Context, PageContent } from '../types'
import { ApiError } from '../utils/api-error'

const NOT_FOUND_STATUS = 404

export async function enterHomeFlow(ctx: Context): Promise<PageContent> {
	const telegramId = String(ctx.from.id)

	await usersControllerGetUser({
		path: { telegramId },
	}).catch(async (error: unknown) => {
		if (error instanceof ApiError && error.status === NOT_FOUND_STATUS) {
			return usersControllerCreateUser({ body: { telegramId } })
		}

		throw error
	})

	return HomePage.render()
}
