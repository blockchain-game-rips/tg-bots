import { usersControllerGetUser } from '../../../generated/api-client'
import { EIP155_NAMESPACE } from '../../constants'
import { WalletPage } from '../../pages/content/wallet/wallet-page'
import { Effect, EffectType, SessionData } from '../../types'
import { fetchNativeBalance } from '../../utils/api'

export async function showWallet(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const { telegramId } = session

	const [balance, { data: user }] = await Promise.all([
		fetchNativeBalance(telegramId),
		usersControllerGetUser({ path: { telegramId }, throwOnError: true }),
	])

	const userEvmAddress = user.wallets[EIP155_NAMESPACE]

	return {
		type: EffectType.EDIT,
		page: WalletPage.render(balance, userEvmAddress),
	}
}
