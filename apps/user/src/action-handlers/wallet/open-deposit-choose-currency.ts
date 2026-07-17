import { ActionDef, withPayload } from '../../action-def'
import { toHold } from '../../flows'
import { DepositChooseCurrencyPage } from '../../pages/wallet/deposit-choose-currency-page'
import { Chain, EffectType } from '../../types'
import { fetchCurrencies } from '../../utils/api/wrappers'
import { chainCodec, getCurrenciesForChain } from '../../utils/chain'

export const openDepositChooseCurrency: ActionDef<Chain> = withPayload(
	chainCodec,
	async (_session, chain) => {
		const currencies = await fetchCurrencies(getCurrenciesForChain(chain))

		return {
			flow: toHold(),
			effect: {
				type: EffectType.EDIT,
				page: DepositChooseCurrencyPage.render(currencies),
			},
		}
	},
)
