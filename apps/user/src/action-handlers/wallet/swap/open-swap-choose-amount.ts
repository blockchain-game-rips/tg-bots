import { ChainAddressDtoOutput } from '@rips/api-client'
import { assertFlow, isFlow, ActionContext } from '@rips/grammy-kit'
import { ActionDef, withPayload } from '../../../action-def'
import { balanceCache } from '../../../cache/balance-cache'
import { Flow, toHold, toStep } from '../../../flows'
import { SwapChooseAmountPage } from '../../../pages/swap/swap-choose-amount-page'
import { EffectType, HandlerResult } from '../../../types'
import { currencyCache } from '../../../cache/currency-cache'
import { currencyChainAddressCodec } from '../../../utils/currency'

export const openSwapChooseAmount: ActionDef<ChainAddressDtoOutput> =
	withPayload(currencyChainAddressCodec, handler)

async function handler(
	actionContext: ActionContext<Flow>,
	dstChainAddress: ChainAddressDtoOutput,
): Promise<HandlerResult<Flow>> {
	if (isFlow(actionContext, 'swap', 'src-dst-amount-chosen')) {
		const { srcChainAddress, dstCurrency } = actionContext.flow.data

		const srcBalance = await balanceCache.getOne(
			actionContext.telegramId,
			srcChainAddress,
		)

		return {
			flow: toHold(),
			effect: {
				type: EffectType.NAVIGATE,
				page: SwapChooseAmountPage.render({ srcBalance, dstCurrency }),
			},
		}
	}

	assertFlow(actionContext, 'swap', 'src-chosen', 'src-dst-chosen')

	const { srcChainAddress } = actionContext.flow.data

	const [srcBalance, dstCurrency] = await Promise.all([
		balanceCache.getOne(actionContext.telegramId, srcChainAddress),
		currencyCache.getOne(dstChainAddress),
	])

	return {
		flow: toStep(actionContext.flow, 'src-dst-chosen', {
			srcChainAddress,
			dstCurrency,
		}),
		effect: {
			type: EffectType.NAVIGATE,
			page: SwapChooseAmountPage.render({ srcBalance, dstCurrency }),
		},
	}
}
