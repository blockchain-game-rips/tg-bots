import { Chain } from '@rips/shared'
import { assertFlow, isFlow, ActionContext } from '@rips/grammy-kit'
import { ActionDef, withPayload } from '../../../action-def'
import { balanceCache } from '../../../cache/balance-cache'
import { Flow, toHold } from '../../../flows'
import { SwapChooseDstTokenPage } from '../../../pages/swap/swap-choose-dst-token-page'
import { EffectType, HandlerResult } from '../../../types'
import { currencyCache } from '../../../cache/currency-cache'
import { chainCodec, getCurrenciesForChain } from '../../../utils/chain'

export const openSwapChooseDstToken: ActionDef<Chain> = withPayload(
	chainCodec,
	handler,
)

async function handler(
	actionContext: ActionContext<Flow>,
	dstChain: Chain,
): Promise<HandlerResult<Flow>> {
	const dstCurrencies = await currencyCache.get(
		getCurrenciesForChain(dstChain),
	)

	if (isFlow(actionContext, 'swap', 'src-dst-amount-chosen')) {
		const { srcChainAddress, amountIn } = actionContext.flow.data

		const srcBalance = await balanceCache.getOne(
			actionContext.telegramId,
			srcChainAddress,
		)

		return {
			flow: toHold(),
			effect: {
				type: EffectType.NAVIGATE,
				page: SwapChooseDstTokenPage.renderDraftEdit(
					{ srcBalance, dstChain, dstCurrencies },
					amountIn,
				),
			},
		}
	}

	assertFlow(actionContext, 'swap', 'src-chosen', 'src-dst-chosen')

	const { srcChainAddress } = actionContext.flow.data

	const srcBalance = await balanceCache.getOne(
		actionContext.telegramId,
		srcChainAddress,
	)

	return {
		flow: toHold(),
		effect: {
			type: EffectType.NAVIGATE,
			page: SwapChooseDstTokenPage.renderFreshDraft({
				srcBalance,
				dstChain,
				dstCurrencies,
			}),
		},
	}
}
