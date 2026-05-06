import {
	adminControllerGetAdminWallet,
	referralSystemControllerGetTierTables,
	ripsControllerGetRipsState,
} from '../../generated/api-client'
import { StatePage } from '../pages/state-page'
import { EffectEdit, EffectType, SessionData } from '../types'

export async function openState(
	_session: SessionData,
	_payload: string | undefined,
): Promise<EffectEdit> {
	const [{ data: state }, { data: adminWallet }, { data: tierTablesRes }] =
		await Promise.all([
			ripsControllerGetRipsState(),
			adminControllerGetAdminWallet(),
			referralSystemControllerGetTierTables(),
		])

	return {
		type: EffectType.EDIT,
		page: StatePage.render(state, adminWallet, tierTablesRes),
	}
}
