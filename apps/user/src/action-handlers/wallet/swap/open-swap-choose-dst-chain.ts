import { ChainAddressDtoOutput } from '@rips/api-client'
import { isFlow, ActionContext } from '@rips/grammy-kit'
import { ActionDef, withPayload } from '../../../action-def'
import { getSupportedChains } from '../../../supported-currencies'
import { Flow, toFlow, toHold } from '../../../flows'
import { SwapChooseDstChainPage } from '../../../pages/swap/swap-choose-dst-chain-page'
import { EffectType, HandlerResult } from '../../../types'
import { balanceCache } from '../../../cache/balance-cache'
import { currencyChainAddressCodec } from '../../../utils/currency'

export const openSwapChooseDstChain: ActionDef<ChainAddressDtoOutput> =
	withPayload(currencyChainAddressCodec, handler)

async function handler(
	actionContext: ActionContext<Flow>,
	srcChainAddress: ChainAddressDtoOutput,
): Promise<HandlerResult<Flow>> {
	const dstChains = getSupportedChains()

	if (isFlow(actionContext, 'swap', 'src-dst-amount-chosen')) {
		const { srcChainAddress: chosenSrc, amountIn } = actionContext.flow.data

		const srcBalance = await balanceCache.getOne(
			actionContext.telegramId,
			chosenSrc,
		)

		return {
			flow: toHold(),
			effect: {
				type: EffectType.NAVIGATE,
				page: SwapChooseDstChainPage.renderDraftEdit({
					srcBalance,
					dstChains,
					amountIn,
				}),
			},
		}
	}

	const srcCurrencyBalance = await balanceCache.getOne(
		actionContext.telegramId,
		srcChainAddress,
	)

	return {
		flow: toFlow('swap', 'src-chosen', { srcChainAddress }),
		effect: {
			type: EffectType.NAVIGATE,
			page: SwapChooseDstChainPage.renderFreshDraft({
				srcBalance: srcCurrencyBalance,
				dstChains,
			}),
		},
	}
}
