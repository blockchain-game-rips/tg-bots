import {
	usersControllerCreateUser,
	usersControllerGetUser,
} from '../../generated/api-client'
import { HomePage } from '../pages/content/home-page'
import { Effect, EffectType, SessionData } from '../types'
import { ApiError } from '../utils/api-error'

const NOT_FOUND_STATUS = 404

export async function showHome(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const { telegramId } = session

	await usersControllerGetUser({ path: { telegramId } }).catch(
		async (error: unknown) => {
			if (
				error instanceof ApiError &&
				error.status === NOT_FOUND_STATUS
			) {
				return usersControllerCreateUser({ body: { telegramId } })
			}

			throw error
		},
	)

	return { type: EffectType.EDIT, page: HomePage.render() }
}
