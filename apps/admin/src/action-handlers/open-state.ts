import {
	adminControllerGetAdminWallet,
	referralSystemControllerGetTierTables,
	ripsControllerGetRipsState,
} from '@rips/api-client'
import { ActionDef } from '@rips/grammy-kit'
import { noPayload } from '../action-def'
import { StatePage } from '../pages/state-page'
import { EffectType } from '../types'
import { adminApiHeader } from '../utils/api'

export const openState: ActionDef<void> = noPayload(async () => {
	const [{ data: state }, { data: adminWallet }, { data: tierTablesRes }] =
		await Promise.all([
			ripsControllerGetRipsState(),
			adminControllerGetAdminWallet({ headers: adminApiHeader }),
			referralSystemControllerGetTierTables(),
		])

	return {
		type: EffectType.EDIT,
		page: StatePage.render(state, adminWallet, tierTablesRes),
	}
})
