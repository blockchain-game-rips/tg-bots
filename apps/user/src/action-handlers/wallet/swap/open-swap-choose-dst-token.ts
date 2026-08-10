import { Chain } from '@rips/shared'
import { assertFlow, isFlow, SessionData } from '@rips/grammy-kit'
import { ActionDef, withPayload } from '../../../action-def'
import { Flow, toHold } from '../../../flows'
import { SwapChooseDstTokenPage } from '../../../pages/swap/swap-choose-dst-token-page'
import { EffectType, HandlerResult } from '../../../types'
import { fetchCurrencies } from '../../../utils/api/wrappers'
import { chainCodec, getCurrenciesForChain } from '../../../utils/chain'

export const openSwapChooseDstToken: ActionDef<Chain> = withPayload(
	chainCodec,
	handler,
)

async function handler(
	session: SessionData<Flow>,
	dstChain: Chain,
): Promise<HandlerResult<Flow>> {
	const dstCurrencies = await fetchCurrencies(getCurrenciesForChain(dstChain))

	if (isFlow(session, 'swap', 'src-dst-amount-chosen')) {
		const { srcCurrencyBalance, amountIn } = session.flow.data

		return {
			flow: toHold(),
			effect: {
				type: EffectType.EDIT,
				page: SwapChooseDstTokenPage.renderDraftEdit(
					{
						srcBalance: srcCurrencyBalance,
						dstChain,
						dstCurrencies,
					},
					amountIn,
				),
			},
		}
	}

	assertFlow(session, 'swap', 'src-chosen', 'src-dst-chosen')

	const { srcCurrencyBalance } = session.flow.data

	return {
		flow: toHold(),
		effect: {
			type: EffectType.EDIT,
			page: SwapChooseDstTokenPage.renderFreshDraft({
				srcBalance: srcCurrencyBalance,
				dstChain,
				dstCurrencies,
			}),
		},
	}
}
