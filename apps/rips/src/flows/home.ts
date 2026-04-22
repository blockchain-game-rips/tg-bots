import type { HTTPError } from 'ky'
import {
	usersControllerCreateUser,
	usersControllerGetUser,
} from '../../generated/api-client'
import { HomePage } from '../pages/content/home-page'
import { Context, PageContent } from '../types'

const NOT_FOUND_STATUS = 404

export async function enterHomeFlow(ctx: Context): Promise<PageContent> {
	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = String(ctx.from.id)

	await usersControllerGetUser({
		path: { telegramId },
		throwOnError: true,
	}).catch(async (error: HTTPError) => {
		if (error.response?.status === NOT_FOUND_STATUS) {
			return usersControllerCreateUser({
				body: { telegramId },
				throwOnError: true,
			})
		}

		throw error
	})

	return HomePage.render()
}
