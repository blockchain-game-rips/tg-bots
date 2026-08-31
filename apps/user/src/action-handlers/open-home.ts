import {
	referralSystemControllerGetReferrer,
	usersControllerCreateUser,
	usersControllerGetUser,
	usersControllerImportUser,
} from '@rips/api-client'
import { assertFlow } from '@rips/grammy-kit'
import { parseEvmPrivateKey } from '@rips/shared'
import { ActionDef, noPayload, withPayload } from '../action-def'
import { actionIds } from '../action-ids'
import { balanceCache } from '../cache/balance-cache'
import { NATIVE_ON_BASE } from '../constants'
import { toFlow, toHold, toReset, type Flow } from '../flows'
import { HomePage } from '../pages/home-page'
import { WelcomePage } from '../pages/onboarding/welcome-page'
import { ImportKeyPrompt } from '../prompts/import-key-prompt'
import { EffectType, HandlerResult } from '../types'
import { referrerAddressCodec } from '../utils/codecs'
import { isApiErrorWithStatus } from '../utils/api/error'
import { fetchUnrevealedPayouts } from '../utils/api/wrappers'
import { userApiKey } from '../utils/api/key'

const NOT_FOUND_STATUS = 404

export const openHome: ActionDef<string | undefined> = withPayload(
	referrerAddressCodec,
	async (actionContext, referrerAddress) => {
		const { telegramId } = actionContext

		const isNewUser = await usersControllerGetUser({
			headers: { 'x-user-key': userApiKey() },
			path: { telegramId: telegramId.toString() },
		})
			.then(() => false)
			.catch((error: unknown) => {
				if (isApiErrorWithStatus(error, NOT_FOUND_STATUS)) return true

				throw error
			})

		if (isNewUser) {
			return {
				flow: toFlow('onboarding', 'choosing-account-type', {
					referrerAddress,
				}),
				effect: {
					type: EffectType.NAVIGATE,
					page: WelcomePage.render(),
					history: { clears: true },
				},
			}
		}

		return renderHome(telegramId)
	},
)

export const chooseCreateAccount: ActionDef<void> = noPayload(
	async (actionContext) => {
		assertFlow(actionContext, 'onboarding', 'choosing-account-type')

		const { telegramId, flow } = actionContext

		await usersControllerCreateUser({
			headers: { 'x-user-key': userApiKey() },
			body: {
				telegramId: telegramId.toString(),
				referrerAddress: flow.data.referrerAddress,
			},
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
	async (actionContext, privateKey) => {
		assertFlow(actionContext, 'onboarding', 'choosing-account-type')

		const { telegramId, flow } = actionContext

		await usersControllerImportUser({
			headers: { 'x-user-key': userApiKey() },
			body: {
				telegramId: telegramId.toString(),
				privateKey,
				referrerAddress: flow.data.referrerAddress,
			},
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
				headers: {
					'x-telegram-id': telegramId.toString(),
					'x-user-key': userApiKey(),
				},
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
