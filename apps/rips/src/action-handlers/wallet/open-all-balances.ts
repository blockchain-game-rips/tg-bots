import { toHold, toReset } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { AllBalancesPage } from '../../pages/wallet/all-balances-page'
import { EffectType } from '../../types'
import { fetchBalances } from '../../utils/api/wrappers'
import { toCurrencyId } from '../../utils/currency'

export const openAllBalances: ActionDef<void> = noPayload((session) => {
	const { telegramId } = session

	return {
		flow: toHold(),
		effect: {
			type: EffectType.SEND_LOADING,
			message: 'Fetching balances...',
			next: async () => {
				const chainAddresses = SUPPORTED_CURRENCIES.map(toCurrencyId)

				const balances = await fetchBalances(telegramId, chainAddresses)

				return {
					flow: toReset(),
					effect: {
						type: EffectType.EDIT,
						page: AllBalancesPage.render(balances),
					},
				}
			},
		},
	}
})
