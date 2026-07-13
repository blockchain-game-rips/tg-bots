import { ActionDef, withPayload } from '../../action-def'
import { toHold } from '../../flows'
import { WithdrawChooseCurrencyPage } from '../../pages/wallet/withdraw-choose-currency-page'
import { Chain, EffectType } from '../../types'
import { fetchCurrencies } from '../../utils/api/wrappers'
import { chainCodec, getCurrenciesForChain } from '../../utils/chain'

export const openWithdrawChooseCurrency: ActionDef<Chain> = withPayload(
	chainCodec,
	async (_session, chain) => {
		const currencies = await fetchCurrencies(getCurrenciesForChain(chain))

		return {
			flow: toHold(),
			effect: {
				type: EffectType.EDIT,
				page: WithdrawChooseCurrencyPage.render(currencies),
			},
		}
	},
)
