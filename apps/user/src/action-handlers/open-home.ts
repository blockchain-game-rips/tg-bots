import {
	referralSystemControllerGetReferrer,
	usersControllerCreateUser,
	usersControllerGetUser,
	usersControllerImportUser,
} from '@rips/api-client'
import { parseEvmPrivateKey } from '@rips/shared'
import { ActionDef, noPayload, withPayload } from '../action-def'
import { actionIds } from '../actions'
import { balanceCache } from '../cache/balance-cache'
import { NATIVE_ON_BASE } from '../constants'
import { toHold, toReset, type Flow } from '../flows'
import { HomePage } from '../pages/home-page'
import { WelcomePage } from '../pages/onboarding/welcome-page'
import { ImportKeyPrompt } from '../prompts/import-key-prompt'
import { EffectType, HandlerResult } from '../types'
import { isApiErrorWithStatus } from '../utils/api/error'
import {
	fetchUnrevealedPayouts,
	toTelegramIdHeader,
} from '../utils/api/wrappers'

const NOT_FOUND_STATUS = 404

export const openHome: ActionDef<void> = noPayload(async (session) => {
	const { telegramId } = session

	const isNewUser = await usersControllerGetUser({
		path: { telegramId: telegramId.toString() },
	})
		.then(() => false)
		.catch((error: unknown) => {
			if (isApiErrorWithStatus(error, NOT_FOUND_STATUS)) return true

			throw error
		})

	if (isNewUser) {
		return {
			flow: toReset(),
			effect: {
				type: EffectType.NAVIGATE,
				page: WelcomePage.render(),
				history: { clears: true },
			},
		}
	}

	return renderHome(telegramId)
})

export const chooseCreateAccount: ActionDef<void> = noPayload(
	async (session) => {
		const { telegramId } = session

		await usersControllerCreateUser({
			body: { telegramId: telegramId.toString() },
		})

		return renderHome(telegramId)
	},
)

export const startImportKey: ActionDef<void> = noPayload(() => ({
	flow: toHold(),
	effect: {
		type: EffectType.ASK,
		prompt: ImportKeyPrompt.render(),
		onSubmit: actionIds.submitImportKey,
	},
}))

export const submitImportKey: ActionDef<string> = withPayload(
	{
		encode: (privateKey) => privateKey,
		decode: (raw) => parseEvmPrivateKey(raw),
	},
	async (session, privateKey) => {
		const { telegramId } = session

		await usersControllerImportUser({
			body: { telegramId: telegramId.toString(), privateKey },
		})

		return renderHome(telegramId)
	},
)

/**
 * Every path here records `openHome` rather than the action that ran, and both
 * callers depend on it: replaying `chooseCreateAccount` would create an account
 * that already exists, and replaying `submitImportKey` would put the typed
 * private key in the back trail. Removing `replayWith` reintroduces both.
 */
async function renderHome(telegramId: number): Promise<HandlerResult<Flow>> {
	const [baseBalance, unrevealedPayouts, { data: referrerData }] =
		await Promise.all([
			balanceCache.getOne(telegramId, NATIVE_ON_BASE),
			fetchUnrevealedPayouts(telegramId),
			referralSystemControllerGetReferrer({
				headers: toTelegramIdHeader(telegramId),
			}),
		])

	const referralFee = referrerData.states[0]?.fee ?? 0

	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page: HomePage.render({
				unopenedPulls: unrevealedPayouts.length,
				baseBalance,
				referralFee,
			}),
			history: { clears: true, replayWith: actionIds.openHome },
		},
	}
}
