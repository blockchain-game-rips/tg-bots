import { Chain } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { toHold } from '../../flows'
import { DepositChooseCurrencyPage } from '../../pages/wallet/deposit-choose-currency-page'
import { EffectType } from '../../types'
import { currencyCache } from '../../cache/currency-cache'
import { chainCodec, getCurrenciesForChain } from '../../utils/chain'

export const openDepositChooseCurrency: ActionDef<Chain> = withPayload(
	chainCodec,
	async (_session, chain) => {
		const currencies = await currencyCache.get(getCurrenciesForChain(chain))

		return {
			flow: toHold(),
			effect: {
				type: EffectType.NAVIGATE,
				page: DepositChooseCurrencyPage.render({ chain, currencies }),
			},
		}
	},
)
