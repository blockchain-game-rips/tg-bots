import {
	ripsControllerGetOngoingRounds,
	usersControllerGetUser,
} from '../../../generated/api-client'
import { StatusPage } from '../../pages/play/status-page'
import { Effect, EffectType, SessionData } from '../../types'
import { evmAddressFromUser } from '../../utils/wallet'

export async function openStatus(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const { telegramId } = session

	const [{ data: roundsData }, { data: user }] = await Promise.all([
		ripsControllerGetOngoingRounds(),
		usersControllerGetUser({ path: { telegramId }, throwOnError: true }),
	])

	return {
		type: EffectType.EDIT,
		page: StatusPage.render(roundsData.rounds, evmAddressFromUser(user)),
	}
}
