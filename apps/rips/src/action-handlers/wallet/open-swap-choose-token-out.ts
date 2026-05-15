import { ActionDef, withPayload } from '../../grammy-kit/action/action-def'
import { SwapChooseTokenPage } from '../../pages/wallet/swap-choose-token'
import { Chain, EffectType } from '../../types'
import { fetchCurrencies } from '../../utils/api/wrappers'
import { findChainIndex, getCurrenciesForChain } from '../../utils/chain'
import { parseChain } from '../../validation/chain-index'

export const openSwapChooseTokenOut: ActionDef<Chain> = withPayload(
	(chain) => findChainIndex(chain).toString(),
	(raw) => parseChain(raw),
	async (_session, chain) => {
		const currencies = await fetchCurrencies(getCurrenciesForChain(chain))

		return {
			type: EffectType.EDIT,
			page: SwapChooseTokenPage.render(currencies, 'out'),
		}
	},
)
