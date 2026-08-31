import {
	adminControllerGetAdminWallet,
	referralSystemControllerGetTierTables,
	ripsControllerGetRipsState,
} from '@rips/api-client'
import { ActionDef, toReset } from '@rips/grammy-kit'
import { noPayload } from '../action-def'
import { StatePage } from '../pages/state-page'
import { EffectType } from '../types'
import { adminApiKey } from '../utils/api'

export const openState: ActionDef<void> = noPayload(async () => {
	const [{ data: state }, { data: adminWallet }, { data: tierTablesRes }] =
		await Promise.all([
			ripsControllerGetRipsState(),
			adminControllerGetAdminWallet({
				headers: { 'x-admin-api-key': adminApiKey },
			}),
			referralSystemControllerGetTierTables(),
		])

	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page: StatePage.render(state, adminWallet, tierTablesRes),
		},
	}
})
