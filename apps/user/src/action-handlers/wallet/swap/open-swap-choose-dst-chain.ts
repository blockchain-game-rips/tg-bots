import { ChainAddressDtoOutput } from '@rips/api-client'
import { isFlow, SessionData } from '@rips/grammy-kit'
import { ActionDef, withPayload } from '../../../action-def'
import { nativeChainAddress, SUPPORTED_CHAINS } from '../../../constants'
import { Flow, toFlow, toHold } from '../../../flows'
import { SwapChooseDstChainPage } from '../../../pages/swap/swap-choose-dst-chain-page'
import { EffectType, HandlerResult } from '../../../types'
import { fetchBalances, getBalance } from '../../../utils/api/wrappers'
import { currencyChainAddressCodec } from '../../../utils/currency'

export const openSwapChooseDstChain: ActionDef<ChainAddressDtoOutput> =
	withPayload(currencyChainAddressCodec, handler)

async function handler(
	session: SessionData<Flow>,
	srcChainAddress: ChainAddressDtoOutput,
): Promise<HandlerResult<Flow>> {
	const dstChains = [...SUPPORTED_CHAINS]

	if (isFlow(session, 'swap', 'src-dst-amount-chosen')) {
		const { srcCurrencyBalance, amountIn } = session.flow.data

		return {
			flow: toHold(),
			effect: {
				type: EffectType.EDIT,
				page: SwapChooseDstChainPage.renderDraftEdit({
					srcBalance: srcCurrencyBalance,
					dstChains,
					amountIn,
				}),
			},
		}
	}

	const { srcCurrencyBalance, nativeCurrencyBalance } = await getBalances(
		srcChainAddress,
		session.telegramId,
	)

	return {
		flow: toFlow('swap', 'src-chosen', {
			srcCurrencyBalance,
			nativeCurrencyBalance,
		}),
		effect: {
			type: EffectType.EDIT,
			page: SwapChooseDstChainPage.renderFreshDraft({
				srcBalance: srcCurrencyBalance,
				dstChains,
			}),
		},
	}
}

async function getBalances(
	srcChainAddress: ChainAddressDtoOutput,
	telegramId: string,
) {
	const nativeChainAddressDto = nativeChainAddress(srcChainAddress.chain)

	const balances = await fetchBalances(telegramId, [
		srcChainAddress,
		nativeChainAddressDto,
	])

	const srcCurrencyBalance = getBalance(balances, srcChainAddress)
	const nativeCurrencyBalance = getBalance(balances, nativeChainAddressDto)

	return { srcCurrencyBalance, nativeCurrencyBalance }
}
