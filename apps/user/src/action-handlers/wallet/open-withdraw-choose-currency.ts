import { Chain } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { toHold } from '../../flows'
import { WithdrawChooseCurrencyPage } from '../../pages/wallet/withdraw-choose-currency-page'
import { EffectType } from '../../types'
import { currencyCache } from '../../cache/currency-cache'
import { chainCodec, getCurrenciesForChain } from '../../utils/chain'

export const openWithdrawChooseCurrency: ActionDef<Chain> = withPayload(
	chainCodec,
	async (_session, chain) => {
		const currencies = await currencyCache.get(getCurrenciesForChain(chain))

		return {
			flow: toHold(),
			effect: {
				type: EffectType.NAVIGATE,
				page: WithdrawChooseCurrencyPage.render({ chain, currencies }),
			},
		}
	},
)
