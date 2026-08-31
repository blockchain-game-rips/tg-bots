import {
	adminControllerGetAdminWallet,
	ripsControllerGetRipsState,
} from '@rips/api-client'
import { ActionDef, toReset } from '@rips/grammy-kit'
import { noPayload } from '../action-def'
import { HomePage } from '../pages/home-page'
import { EffectType } from '../types'
import { adminApiKey } from '../utils/api'

export const openHome: ActionDef<void> = noPayload(async () => {
	const [{ data: state }, { data: adminWallet }] = await Promise.all([
		ripsControllerGetRipsState(),
		adminControllerGetAdminWallet({
			headers: { 'x-admin-api-key': adminApiKey },
		}),
	])

	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page: HomePage.render(state, adminWallet),
			history: { clears: true },
		},
	}
})
