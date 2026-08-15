import { isFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../../action-def'
import { getSupportedChains } from '../../../supported-currencies'
import { toHold, toReset } from '../../../flows'
import { SwapChooseSrcChainPage } from '../../../pages/swap/swap-choose-src-chain-page'
import { EffectType } from '../../../types'
import { currencyCache } from '../../../cache/currency-cache'

export const openSwapChooseSrcChain: ActionDef<void> = noPayload(
	async (session) => {
		const chains = getSupportedChains()

		if (isFlow(session, 'swap', 'src-dst-amount-chosen')) {
			const { srcChainAddress, dstCurrency, amountIn } = session.flow.data

			const srcCurrency = await currencyCache.getOne(srcChainAddress)

			return {
				flow: toHold(),
				effect: {
					type: EffectType.NAVIGATE,
					page: SwapChooseSrcChainPage.renderDraftEdit({
						chains,
						srcCurrency,
						dstCurrency,
						amountIn,
					}),
				},
			}
		}

		return {
			flow: toReset(),
			effect: {
				type: EffectType.NAVIGATE,
				page: SwapChooseSrcChainPage.renderFreshDraft({ chains }),
			},
		}
	},
)
