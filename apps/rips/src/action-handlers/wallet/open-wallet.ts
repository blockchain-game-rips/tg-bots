import { usersControllerGetUser } from '../../../generated/api-client'
import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { WalletPage } from '../../pages/wallet/wallet-page'
import { EffectType } from '../../types'
import { fetchNativeBalance } from '../../utils/api'
import { evmAddressFromUser } from '../../utils/wallet'

export const openWallet: ActionDef<void> = noPayload(async (session) => {
	const { telegramId } = session

	const [balance, { data: user }] = await Promise.all([
		fetchNativeBalance(telegramId),
		usersControllerGetUser({ path: { telegramId }, throwOnError: true }),
	])

	return {
		type: EffectType.EDIT,
		page: WalletPage.render(balance, evmAddressFromUser(user)),
	}
})
