import {
	usersControllerCreateUser,
	usersControllerGetUser,
} from '../../generated/api-client'
import { HomePage } from '../pages/home-page'
import { EffectEdit, EffectType, SessionData } from '../types'
import { isApiErrorWithStatus } from '../utils/action-handler-utils'

const NOT_FOUND_STATUS = 404

export async function openHome(
	session: SessionData,
	_payload: string | undefined,
): Promise<EffectEdit> {
	const { telegramId } = session

	await usersControllerGetUser({ path: { telegramId } }).catch(
		async (error: unknown) => {
			if (isApiErrorWithStatus(error, NOT_FOUND_STATUS)) {
				return usersControllerCreateUser({ body: { telegramId } })
			}

			throw error
		},
	)

	return { type: EffectType.EDIT, page: HomePage.render() }
}
