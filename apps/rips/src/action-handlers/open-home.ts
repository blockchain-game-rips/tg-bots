import {
	referralSystemControllerGetReferrer,
	usersControllerCreateUser,
	usersControllerGetUser,
} from '@rips/api-client'
import { toReset } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../action-def'
import { HomePage } from '../pages/home-page'
import { EffectType } from '../types'
import { isApiErrorWithStatus } from '../utils/api/error'
import {
	fetchNativeBalance,
	fetchUnrevealedPayouts,
} from '../utils/api/wrappers'

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

	const [baseBalance, unrevealedPayouts, { data: referrerData }] =
		await Promise.all([
			fetchNativeBalance(telegramId),
			fetchUnrevealedPayouts(telegramId),
			referralSystemControllerGetReferrer({
				headers: { 'x-telegram-id': telegramId },
			}),
		])

	const referralFee = referrerData.states[0]?.fee ?? 0

	return {
		flow: toReset(),
		effect: {
			type: EffectType.EDIT,
			page: HomePage.render({
				unopenedPulls: unrevealedPayouts.length,
				baseBalance,
				referralFee,
			}),
		},
	}
})
