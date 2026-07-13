import { isFlow, toHold } from '@rips/grammy-kit'
import { parseChain } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { SUPPORTED_CHAINS } from '../../constants'
import { SwapChooseSrcTokenPage } from '../../pages/swap/swap-choose-src-token-page'
import { Chain, EffectType } from '../../types'
import { fetchCurrencies } from '../../utils/api/wrappers'
import { findChainIndex, getCurrenciesForChain } from '../../utils/chain'

export const openSwapChooseSrcToken: ActionDef<Chain> = withPayload(
	(chain) => findChainIndex(chain).toString(),
	(raw) => parseChain(raw, SUPPORTED_CHAINS),
	async (session, srcChain) => {
		const currencies = await fetchCurrencies(
			getCurrenciesForChain(srcChain),
		)

		if (isFlow(session, 'swap', 'src-dst-amount-chosen')) {
			const { dstCurrency, amountIn } = session.flow.data

			return {
				flow: toHold(),
				effect: {
					type: EffectType.EDIT,
					page: SwapChooseSrcTokenPage.renderDraftEdit({
						srcChain,
						currencies,
						dstCurrency,
						amount: amountIn,
					}),
				},
			}
		}

		return {
			flow: toHold(),
			effect: {
				type: EffectType.EDIT,
				page: SwapChooseSrcTokenPage.renderFreshDraft({
					srcChain,
					currencies,
				}),
			},
		}
	},
)
