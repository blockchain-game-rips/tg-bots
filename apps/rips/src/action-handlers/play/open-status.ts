import {
	ripsControllerGetOngoingRounds,
	usersControllerGetUser,
} from '../../../generated/api-client'
import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { StatusPage } from '../../pages/play/status-page'
import { EffectType } from '../../types'
import { evmAddressFromUser } from '../../utils/wallet'

export const openStatus: ActionDef<void> = noPayload(async (session) => {
	const { telegramId } = session

	const [{ data: roundsData }, { data: user }] = await Promise.all([
		ripsControllerGetOngoingRounds(),
		usersControllerGetUser({ path: { telegramId }, throwOnError: true }),
	])

	return {
		type: EffectType.EDIT,
		page: StatusPage.render(roundsData.rounds, evmAddressFromUser(user)),
	}
})
