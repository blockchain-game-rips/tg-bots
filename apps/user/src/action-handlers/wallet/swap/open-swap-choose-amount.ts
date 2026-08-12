import { ChainAddressDtoOutput } from '@rips/api-client'
import { assertFlow, isFlow, SessionData } from '@rips/grammy-kit'
import { ActionDef, withPayload } from '../../../action-def'
import { Flow, toHold, toStep } from '../../../flows'
import { SwapChooseAmountPage } from '../../../pages/swap/swap-choose-amount-page'
import { EffectType, HandlerResult } from '../../../types'
import { fetchCurrency } from '../../../utils/api/wrappers'
import { currencyChainAddressCodec } from '../../../utils/currency'

export const openSwapChooseAmount: ActionDef<ChainAddressDtoOutput> =
	withPayload(currencyChainAddressCodec, handler)

async function handler(
	session: SessionData<Flow>,
	dstChainAddress: ChainAddressDtoOutput,
): Promise<HandlerResult<Flow>> {
	if (isFlow(session, 'swap', 'src-dst-amount-chosen')) {
		const { srcCurrencyBalance, dstCurrency } = session.flow.data

		return {
			flow: toHold(),
			effect: {
				type: EffectType.NAVIGATE,
				page: SwapChooseAmountPage.renderDraftEdit({
					srcBalance: srcCurrencyBalance,
					dstCurrency,
				}),
			},
		}
	}

	assertFlow(session, 'swap', 'src-chosen', 'src-dst-chosen')

	const { srcCurrencyBalance, nativeCurrencyBalance } = session.flow.data

	const dstCurrency = await fetchCurrency(dstChainAddress)

	return {
		flow: toStep(session.flow, 'src-dst-chosen', {
			srcCurrencyBalance,
			nativeCurrencyBalance,
			dstCurrency,
		}),
		effect: {
			type: EffectType.NAVIGATE,
			page: SwapChooseAmountPage.renderFreshDraft({
				srcBalance: srcCurrencyBalance,
				dstCurrency,
			}),
		},
	}
}
