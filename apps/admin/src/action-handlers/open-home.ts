import {
	adminControllerGetAdminWallet,
	ripsControllerGetRipsState,
} from '@rips/api-client'
import { ActionDef } from '@rips/grammy-kit'
import { noPayload } from '../action-def'
import { HomePage } from '../pages/home-page'
import { EffectType } from '../types'
import { adminApiHeader } from '../utils/api'

export const openHome: ActionDef<void> = noPayload(async () => {
	const [{ data: state }, { data: adminWallet }] = await Promise.all([
		ripsControllerGetRipsState(),
		adminControllerGetAdminWallet({ headers: adminApiHeader }),
	])

	return {
		type: EffectType.EDIT,
		page: HomePage.render(state, adminWallet),
	}
})
