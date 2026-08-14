import { ChainAddressDtoOutput } from '@rips/api-client'
import { isFlow, SessionData } from '@rips/grammy-kit'
import { ActionDef, withPayload } from '../../../action-def'
import { SUPPORTED_CHAINS } from '../../../constants'
import { Flow, toFlow, toHold } from '../../../flows'
import { SwapChooseDstChainPage } from '../../../pages/swap/swap-choose-dst-chain-page'
import { EffectType, HandlerResult } from '../../../types'
import { balanceCache } from '../../../cache/balance-cache'
import { currencyChainAddressCodec } from '../../../utils/currency'

export const openSwapChooseDstChain: ActionDef<ChainAddressDtoOutput> =
	withPayload(currencyChainAddressCodec, handler)

async function handler(
	session: SessionData<Flow>,
	srcChainAddress: ChainAddressDtoOutput,
): Promise<HandlerResult<Flow>> {
	const dstChains = [...SUPPORTED_CHAINS]

	if (isFlow(session, 'swap', 'src-dst-amount-chosen')) {
		const { srcChainAddress: chosenSrc, amountIn } = session.flow.data

		const srcBalance = await balanceCache.getOne(
			session.telegramId,
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
		session.telegramId,
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
