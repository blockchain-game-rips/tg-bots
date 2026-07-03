import { usersControllerGetUser } from '@rips/api-client'
import { toReset } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { WalletPage } from '../../pages/wallet/wallet-page'
import { EffectType } from '../../types'
import { fetchNativeBalance } from '../../utils/api/wrappers'
import { evmAddressFromUser } from '../../utils/wallet'

export const openWallet: ActionDef<void> = noPayload(async (session) => {
	const { telegramId } = session

	const [balance, { data: user }] = await Promise.all([
		fetchNativeBalance(telegramId),
		usersControllerGetUser({ path: { telegramId }, throwOnError: true }),
	])

	return {
		flow: toReset(),
		effect: {
			type: EffectType.EDIT,
			page: WalletPage.render(balance, evmAddressFromUser(user)),
		},
	}
})
