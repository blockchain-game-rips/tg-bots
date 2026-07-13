import { ActionDef, noPayload } from '../../action-def'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { toHold, toReset } from '../../flows'
import { AllBalancesPage } from '../../pages/wallet/all-balances-page'
import { EffectType } from '../../types'
import { fetchBalances } from '../../utils/api/wrappers'

export const openAllBalances: ActionDef<void> = noPayload((session) => {
	const { telegramId } = session

	return {
		flow: toHold(),
		effect: {
			type: EffectType.SEND_LOADING,
			message: 'Fetching balances...',
			next: async () => {
				const balances = await fetchBalances(
					telegramId,
					SUPPORTED_CURRENCIES,
				)

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
