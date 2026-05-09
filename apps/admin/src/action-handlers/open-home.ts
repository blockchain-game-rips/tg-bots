import {
	adminControllerGetAdminWallet,
	ripsControllerGetRipsState,
} from '../../generated/api-client'
import { HomePage } from '../pages/home-page'
import { EffectEdit, EffectType, SessionData } from '../types'
import { adminApiHeader } from '../utils/api'

export async function openHome(
	_session: SessionData,
	_payload: string | undefined,
): Promise<EffectEdit> {
	const [{ data: state }, { data: adminWallet }] = await Promise.all([
		ripsControllerGetRipsState(),
		adminControllerGetAdminWallet({ headers: adminApiHeader }),
	])

	return {
		type: EffectType.EDIT,
		page: HomePage.render(state, adminWallet),
	}
}
