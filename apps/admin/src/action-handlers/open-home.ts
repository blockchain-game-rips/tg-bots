import {
	adminControllerGetAdminWallet,
	referralSystemControllerGetTierTables,
	ripsControllerGetRipsState,
} from '../../generated/api-client'
import { HomePage } from '../pages/home-page'
import { EffectEdit, EffectType, SessionData } from '../types'

export async function openHome(
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
		page: HomePage.render(state, adminWallet, tierTablesRes),
	}
}
