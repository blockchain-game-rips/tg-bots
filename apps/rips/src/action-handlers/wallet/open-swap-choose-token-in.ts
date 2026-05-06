import { ActionDef, withPayload } from '../../action-def'
import { SUPPORTED_CHAINS, SUPPORTED_CURRENCIES } from '../../constants'
import { SwapChooseTokenPage } from '../../pages/wallet/swap-choose-token'
import { Chain, EffectType } from '../../types'
import { fetchCurrencies } from '../../utils/api'
import { toCurrencyId } from '../../utils/currency'
import { parseChain } from '../../validation/chain-index'

export const openSwapChooseTokenIn: ActionDef<Chain> = withPayload(
	(chain) =>
		SUPPORTED_CHAINS.findIndex(
			(c) =>
				c.namespace === chain.namespace &&
				c.reference === chain.reference,
		).toString(),
	(raw) => parseChain(raw),
	async (_session, chain) => {
		const chainCurrencyIds = SUPPORTED_CURRENCIES.filter(
			(c) =>
				c.chain.namespace === chain.namespace &&
				c.chain.reference === chain.reference,
		).map(toCurrencyId)

		const currencies = await fetchCurrencies(chainCurrencyIds)

		return {
			type: EffectType.EDIT,
			page: SwapChooseTokenPage.render(currencies, 'in'),
		}
	},
)
