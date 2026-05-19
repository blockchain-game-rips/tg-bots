import {
	usersControllerCreateUser,
	usersControllerGetUser,
} from '../../generated/api-client'
import { ActionDef, noPayload } from '../action-def'
import { HomePage } from '../pages/home-page'
import { EffectType } from '../types'
import { isApiErrorWithStatus } from '../utils/api/error'

const NOT_FOUND_STATUS = 404

export const openHome: ActionDef<void> = noPayload(async (session) => {
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
})
