import {
	ChainAddressDto,
	CurrencyAmountDto,
	CurrencyDto,
	QuoteSwapResponseDtoOutput,
	QuoteSwapSamechainResponseDtoOutput,
	walletsControllerQuoteSwapCrosschain,
	walletsControllerQuoteSwapSamechain,
} from '@rips/api-client'
import { assertFlow } from '@rips/grammy-kit'
import { parseCurrencyAmount } from '@rips/shared'
import { ActionDef, noPayload, withPayload } from '../../action-def'
import { nativeChainAddress } from '../../constants'
import { Flow, toFlow } from '../../flows'
import { SwapCheckoutPage } from '../../pages/swap/swap-checkout-page'
import { Chain, EffectType, HandlerResult } from '../../types'
import {
	fetchBalances,
	fetchCurrency,
	getBalance,
} from '../../utils/api/wrappers'
import { rawStringCodec } from '../../utils/codecs'
import { currencyChainAddressCodec } from '../../utils/currency'

interface CheckoutDraft {
	srcCurrencyBalance: CurrencyAmountDto
	nativeCurrencyBalance: CurrencyAmountDto
	dstCurrency: CurrencyDto
	amountIn: CurrencyAmountDto
}

export const openSwapCheckout: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'swap', 'src-dst-amount-chosen')

	return renderCheckout(session.telegramId, session.flow.data)
})

export const openSwapCheckoutFromSrc: ActionDef<ChainAddressDto> = withPayload(
	currencyChainAddressCodec,
	async (session, srcChainAddress) => {
		assertFlow(session, 'swap', 'src-dst-amount-chosen')

		const { dstCurrency, amountIn } = session.flow.data

		const balances = await fetchSrcAndNativeBalances(
			session.telegramId,
			srcChainAddress,
		)

		return renderCheckout(session.telegramId, {
			...balances,
			dstCurrency,
			amountIn,
		})
	},
)

export const openSwapCheckoutFromDst: ActionDef<ChainAddressDto> = withPayload(
	currencyChainAddressCodec,
	async (session, dstChainAddress) => {
		assertFlow(session, 'swap', 'src-dst-amount-chosen')

		const { srcCurrencyBalance, nativeCurrencyBalance, amountIn } =
			session.flow.data

		const dstCurrency = await fetchCurrency(dstChainAddress)

		return renderCheckout(session.telegramId, {
			srcCurrencyBalance,
			nativeCurrencyBalance,
			dstCurrency,
			amountIn,
		})
	},
)

export const openSwapCheckoutFromAmount: ActionDef<string> = withPayload(
	rawStringCodec,
	(session, amountRaw) => {
		assertFlow(session, 'swap', 'src-dst-chosen', 'src-dst-amount-chosen')

		const { srcCurrencyBalance, nativeCurrencyBalance, dstCurrency } =
			session.flow.data

		const amountIn = parseCurrencyAmount(
			amountRaw,
			srcCurrencyBalance.currency,
		)

		return renderCheckout(session.telegramId, {
			srcCurrencyBalance,
			nativeCurrencyBalance,
			dstCurrency,
			amountIn,
		})
	},
)

async function renderCheckout(
	telegramId: string,
	draft: CheckoutDraft,
): Promise<HandlerResult<Flow>> {
	const { srcCurrencyBalance, nativeCurrencyBalance, dstCurrency, amountIn } =
		draft

	const quote = await fetchSwapQuote(telegramId, amountIn, dstCurrency)

	return {
		flow: toFlow('swap', 'src-dst-amount-chosen', draft),
		effect: {
			type: EffectType.EDIT,
			page: SwapCheckoutPage.render({
				srcCurrency: srcCurrencyBalance.currency,
				srcBalance: srcCurrencyBalance,
				nativeBalance: nativeCurrencyBalance,
				dstCurrency,
				amountIn,
				quote,
			}),
		},
	}
}

async function fetchSrcAndNativeBalances(
	telegramId: string,
	srcChainAddress: ChainAddressDto,
) {
	const nativeChainAddressDto = nativeChainAddress(srcChainAddress.chain)

	const balances = await fetchBalances(telegramId, [
		srcChainAddress,
		nativeChainAddressDto,
	])

	return {
		srcCurrencyBalance: getBalance(balances, srcChainAddress),
		nativeCurrencyBalance: getBalance(balances, nativeChainAddressDto),
	}
}

type SwapQuote =
	| { kind: 'crosschain'; quote: QuoteSwapResponseDtoOutput }
	| { kind: 'samechain'; quote: QuoteSwapSamechainResponseDtoOutput }

async function fetchSwapQuote(
	telegramId: string,
	amountIn: CurrencyAmountDto,
	dstCurrency: CurrencyDto,
): Promise<SwapQuote> {
	const headers = { 'x-telegram-id': telegramId }
	const body = {
		tokenInChainAddress: amountIn.currency.chainAddress,
		tokenOutChainAddress: dstCurrency.chainAddress,
		amountIn: amountIn.amount,
	}

	if (
		isSameChain(
			amountIn.currency.chainAddress.chain,
			dstCurrency.chainAddress.chain,
		)
	) {
		const { data } = await walletsControllerQuoteSwapSamechain({
			headers,
			body,
		})

		return { kind: 'samechain', quote: data }
	}

	const { data } = await walletsControllerQuoteSwapCrosschain({
		headers,
		body,
	})

	return { kind: 'crosschain', quote: data }
}

function isSameChain(a: Chain, b: Chain): boolean {
	return a.namespace === b.namespace && a.reference === b.reference
}
