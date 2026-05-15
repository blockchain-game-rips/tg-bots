import { SUPPORTED_CURRENCIES } from '../../constants'
import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { AllBalancesPage } from '../../pages/wallet/all-balances-page'
import { EffectType } from '../../types'
import { fetchBalances } from '../../utils/api/wrappers'
import { chainAddressToString } from '../../utils/currency'

export const openAllBalances: ActionDef<void> = noPayload((session) => {
	const { telegramId } = session

	return {
		type: EffectType.SEND_LOADING,
		message: 'Fetching balances...',
		next: async () => {
			const chainAddresses =
				SUPPORTED_CURRENCIES.map(chainAddressToString)

			const balances = await fetchBalances(telegramId, chainAddresses)

			return {
				type: EffectType.EDIT,
				page: AllBalancesPage.render(balances),
			}
		},
	}
})
