import { ActionDef, noPayload } from '../../action-def'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { toReset } from '../../flows'
import { WalletPage } from '../../pages/wallet/wallet-page'
import { EffectType } from '../../types'
import { balanceCache } from '../../cache/balance-cache'

export const openWallet: ActionDef<void> = noPayload(async (session) => {
	const { telegramId } = session

	const balances = await balanceCache.get(telegramId, SUPPORTED_CURRENCIES)

	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page: WalletPage.render(balances),
		},
	}
})
