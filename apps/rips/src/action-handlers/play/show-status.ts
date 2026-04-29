import {
	ripsControllerGetOngoingRounds,
	usersControllerGetUser,
} from '../../../generated/api-client'
import { EIP155_NAMESPACE } from '../../constants'
import { StatusPage } from '../../pages/play/status-page'
import { Effect, EffectType, SessionData } from '../../types'

export async function showStatus(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const { telegramId } = session

	const [{ data: roundsData }, { data: user }] = await Promise.all([
		ripsControllerGetOngoingRounds(),
		usersControllerGetUser({ path: { telegramId }, throwOnError: true }),
	])

	const userEvmAddress = user.wallets[EIP155_NAMESPACE]

	if (userEvmAddress === undefined) {
		throw new Error('User has no EVM wallet')
	}

	return {
		type: EffectType.EDIT,
		page: StatusPage.render(roundsData.rounds, userEvmAddress),
	}
}
