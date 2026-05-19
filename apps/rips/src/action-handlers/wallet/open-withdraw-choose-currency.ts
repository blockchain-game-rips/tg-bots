import { ActionDef, withPayload } from '../../action-def'
import { WithdrawChooseCurrencyPage } from '../../pages/wallet/withdraw-choose-currency-page'
import { Chain, EffectType } from '../../types'
import { fetchCurrencies } from '../../utils/api/wrappers'
import { findChainIndex, getCurrenciesForChain } from '../../utils/chain'
import { parseChain } from '../../validation/chain-index'

export const openWithdrawChooseCurrency: ActionDef<Chain> = withPayload(
	(chain) => findChainIndex(chain).toString(),
	(raw) => parseChain(raw),
	async (_session, chain) => {
		const currencies = await fetchCurrencies(getCurrenciesForChain(chain))

		return {
			type: EffectType.EDIT,
			page: WithdrawChooseCurrencyPage.render(currencies),
		}
	},
)
