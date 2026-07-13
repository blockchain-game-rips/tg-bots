import {
	ripsControllerGetOngoingRips,
	usersControllerGetUser,
} from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { toReset } from '../../flows'
import { StatusPage } from '../../pages/play/status-page'
import { EffectType } from '../../types'
import { evmAddressFromUser } from '../../utils/wallet'

export const openStatus: ActionDef<void> = noPayload(async (session) => {
	const { telegramId } = session

	const [{ data: ripsData }, { data: user }] = await Promise.all([
		ripsControllerGetOngoingRips(),
		usersControllerGetUser({ path: { telegramId }, throwOnError: true }),
	])

	return {
		flow: toReset(),
		effect: {
			type: EffectType.EDIT,
			page: StatusPage.render(ripsData.rips, evmAddressFromUser(user)),
		},
	}
})
