import { usersControllerGetUser } from '../../../generated/api-client'
import { WalletPage } from '../../pages/wallet/wallet-page'
import { Effect, EffectType, SessionData } from '../../types'
import { fetchNativeBalance } from '../../utils/api'
import { evmAddressFromUser } from '../../utils/wallet'

export async function openWallet(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const { telegramId } = session

	const [balance, { data: user }] = await Promise.all([
		fetchNativeBalance(telegramId),
		usersControllerGetUser({ path: { telegramId }, throwOnError: true }),
	])

	return {
		type: EffectType.EDIT,
		page: WalletPage.render(balance, evmAddressFromUser(user)),
	}
}
