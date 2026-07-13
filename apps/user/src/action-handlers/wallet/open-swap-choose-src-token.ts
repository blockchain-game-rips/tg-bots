import { isFlow } from '@rips/grammy-kit'
import { ActionDef, withPayload } from '../../action-def'
import { toHold } from '../../flows'
import { SwapChooseSrcTokenPage } from '../../pages/swap/swap-choose-src-token-page'
import { Chain, EffectType } from '../../types'
import { fetchCurrencies } from '../../utils/api/wrappers'
import { chainCodec, getCurrenciesForChain } from '../../utils/chain'

export const openSwapChooseSrcToken: ActionDef<Chain> = withPayload(
	chainCodec,
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
