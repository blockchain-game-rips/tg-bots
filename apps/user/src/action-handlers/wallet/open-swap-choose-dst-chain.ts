import { ChainAddressDto } from '@rips/api-client'
import { isFlow, toFlow, toHold } from '@rips/grammy-kit'
import { parseCurrencyChainAddress } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import {
	nativeChainAddress,
	SUPPORTED_CHAINS,
	SUPPORTED_CURRENCIES,
} from '../../constants'
import { Flow } from '../../flows'
import { SwapChooseDstChainPage } from '../../pages/swap/swap-choose-dst-chain-page'
import { EffectType } from '../../types'
import { fetchBalances, getBalance } from '../../utils/api/wrappers'
import { findCurrencyIndex } from '../../utils/currency'

export const openSwapChooseDstChain: ActionDef<ChainAddressDto> = withPayload(
	(currencyChainAddress) =>
		findCurrencyIndex(currencyChainAddress).toString(),
	(raw) => parseCurrencyChainAddress(raw, SUPPORTED_CURRENCIES),
	async (session, srcChainAddress) => {
		const dstChains = [...SUPPORTED_CHAINS]

		if (isFlow(session, 'swap', 'src-dst-amount-chosen')) {
			const { srcCurrencyBalance, amountIn } = session.flow.data

			return {
				flow: toHold(),
				effect: {
					type: EffectType.EDIT,
					page: SwapChooseDstChainPage.renderDraftEdit({
						srcCurrency: srcCurrencyBalance.currency,
						srcBalance: srcCurrencyBalance,
						dstChains,
						amount: amountIn,
					}),
				},
			}
		}

		const { srcCurrencyBalance, nativeCurrencyBalance } = await getBalances(
			srcChainAddress,
			session.telegramId,
		)

		const flow = toFlow<Flow, 'swap', 'src-chosen'>('swap', 'src-chosen', {
			srcCurrencyBalance,
			nativeCurrencyBalance,
		})

		return {
			flow,
			effect: {
				type: EffectType.EDIT,
				page: SwapChooseDstChainPage.renderFreshDraft({
					srcCurrency: srcCurrencyBalance.currency,
					srcBalance: srcCurrencyBalance,
					dstChains,
				}),
			},
		}
	},
)

async function getBalances(
	srcChainAddress: ChainAddressDto,
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
