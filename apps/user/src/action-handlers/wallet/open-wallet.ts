import { ActionDef, noPayload } from '../../action-def'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { toReset } from '../../flows'
import { WalletPage } from '../../pages/wallet/wallet-page'
import { EffectType } from '../../types'
import { fetchBalances } from '../../utils/api/wrappers'

export const openWallet: ActionDef<void> = noPayload(async (session) => {
	const { telegramId } = session

	const balances = await fetchBalances(telegramId, SUPPORTED_CURRENCIES)

	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page: WalletPage.render(balances),
		},
	}
})
