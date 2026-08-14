import { Chain } from '@rips/shared'
import { isFlow } from '@rips/grammy-kit'
import { ActionDef, withPayload } from '../../../action-def'
import { toHold } from '../../../flows'
import { SwapChooseSrcTokenPage } from '../../../pages/swap/swap-choose-src-token-page'
import { EffectType } from '../../../types'
import { currencyCache } from '../../../cache/currency-cache'
import { chainCodec, getCurrenciesForChain } from '../../../utils/chain'

export const openSwapChooseSrcToken: ActionDef<Chain> = withPayload(
	chainCodec,
	async (session, srcChain) => {
		const currencies = await currencyCache.get(
			getCurrenciesForChain(srcChain),
		)

		if (isFlow(session, 'swap', 'src-dst-amount-chosen')) {
			const { srcChainAddress, dstCurrency, amountIn } = session.flow.data

			const srcCurrency = await currencyCache.getOne(srcChainAddress)

			return {
				flow: toHold(),
				effect: {
					type: EffectType.NAVIGATE,
					page: SwapChooseSrcTokenPage.renderDraftEdit({
						srcChain,
						currencies,
						srcCurrency,
						dstCurrency,
						amountIn,
					}),
				},
			}
		}

		return {
			flow: toHold(),
			effect: {
				type: EffectType.NAVIGATE,
				page: SwapChooseSrcTokenPage.renderFreshDraft({
					srcChain,
					currencies,
				}),
			},
		}
	},
)
