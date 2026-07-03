import { toHold } from '@rips/grammy-kit'
import { parseChain } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { SUPPORTED_CHAINS } from '../../constants'
import { SwapChooseTokenPage } from '../../pages/wallet/swap-choose-token'
import { Chain, EffectType } from '../../types'
import { fetchCurrencies } from '../../utils/api/wrappers'
import { findChainIndex, getCurrenciesForChain } from '../../utils/chain'

export const openSwapChooseTokenOut: ActionDef<Chain> = withPayload(
	(chain) => findChainIndex(chain).toString(),
	(raw) => parseChain(raw, SUPPORTED_CHAINS),
	async (_session, chain) => {
		const currencies = await fetchCurrencies(getCurrenciesForChain(chain))

		return {
			flow: toHold(),
			effect: {
				type: EffectType.EDIT,
				page: SwapChooseTokenPage.render(currencies, 'out'),
			},
		}
	},
)
