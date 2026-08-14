import {
	ChainAddressDtoOutput,
	CurrencyAmountDtoOutput,
	CurrencyDtoOutput,
	QuoteSwapResponseDtoOutput,
	QuoteSwapSamechainResponseDtoOutput,
	walletsControllerQuoteSwapCrosschain,
	walletsControllerQuoteSwapSamechain,
} from '@rips/api-client'
import { assertFlow } from '@rips/grammy-kit'
import {
	currencyToChain,
	isSameChain,
	parseCurrencyAmount,
	rescaleAmount,
	toCurrencyAmount,
	usdToTokenUnits,
} from '@rips/shared'
import { ActionDef, noPayload, withPayload } from '../../../action-def'
import {
	isNativeChainAddress,
	NATIVE_MAX_MARGIN_USD,
	nativeChainAddress,
} from '../../../constants'
import { Flow, toFlow } from '../../../flows'
import { SwapCheckoutPage } from '../../../pages/swap/swap-checkout-page'
import { EffectType, HandlerResult } from '../../../types'
import { balanceCache } from '../../../cache/balance-cache'
import { fetchCurrency } from '../../../utils/api/wrappers'
import { AmountPayload, amountCodec } from '../../../utils/codecs'
import { currencyChainAddressCodec } from '../../../utils/currency'

interface CheckoutDraft {
	srcCurrencyBalance: CurrencyAmountDtoOutput
	nativeCurrencyBalance: CurrencyAmountDtoOutput
	dstCurrency: CurrencyDtoOutput
	amountIn: bigint
}

export const openSwapCheckout: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'swap', 'src-dst-amount-chosen')

	return renderCheckout(session.telegramId, session.flow.data)
})

export const openSwapCheckoutFromSrc: ActionDef<ChainAddressDtoOutput> =
	withPayload(currencyChainAddressCodec, async (session, srcChainAddress) => {
		assertFlow(session, 'swap', 'src-dst-amount-chosen')

		const {
			dstCurrency,
			amountIn,
			srcCurrencyBalance: prevSrcBalance,
		} = session.flow.data

		const balances = await fetchSrcAndNativeBalances(
			session.telegramId,
			srcChainAddress,
		)

		const rescaledAmountIn = rescaleAmount(
			amountIn,
			prevSrcBalance.currency.decimals,
			balances.srcCurrencyBalance.currency.decimals,
		)

		return renderCheckout(session.telegramId, {
			...balances,
			dstCurrency,
			amountIn: rescaledAmountIn,
		})
	})

export const openSwapCheckoutFromDst: ActionDef<ChainAddressDtoOutput> =
	withPayload(currencyChainAddressCodec, async (session, dstChainAddress) => {
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
	})

export const openSwapCheckoutFromAmount: ActionDef<AmountPayload> = withPayload(
	amountCodec,
	async (session, amountPayload) => {
		assertFlow(session, 'swap', 'src-dst-chosen', 'src-dst-amount-chosen')

		const { srcCurrencyBalance, nativeCurrencyBalance, dstCurrency } =
			session.flow.data

		const amountIn = await resolveAmountIn(
			session.telegramId,
			amountPayload,
			srcCurrencyBalance,
			dstCurrency,
		)

		return renderCheckout(session.telegramId, {
			srcCurrencyBalance,
			nativeCurrencyBalance,
			dstCurrency,
			amountIn,
		})
	},
)

async function resolveAmountIn(
	telegramId: string,
	amountPayload: AmountPayload,
	srcCurrencyBalance: CurrencyAmountDtoOutput,
	dstCurrency: CurrencyDtoOutput,
): Promise<bigint> {
	const srcCurrency = srcCurrencyBalance.currency

	if (amountPayload.kind === 'exact') {
		return BigInt(
			parseCurrencyAmount(String(amountPayload.value), srcCurrency)
				.amount,
		)
	}

	if (!isNativeChainAddress(srcCurrency.chainAddress)) {
		return BigInt(srcCurrencyBalance.amount)
	}

	return resolveNativeMaxAmount(telegramId, srcCurrencyBalance, dstCurrency)
}

async function resolveNativeMaxAmount(
	telegramId: string,
	srcCurrencyBalance: CurrencyAmountDtoOutput,
	dstCurrency: CurrencyDtoOutput,
): Promise<bigint> {
	const srcCurrency = srcCurrencyBalance.currency

	const probeQuote = await fetchSwapQuote(
		telegramId,
		srcCurrencyBalance,
		dstCurrency,
	)

	const nativeFee = sumNativeFees(probeQuote, srcCurrency)
	const margin = usdToTokenUnits(NATIVE_MAX_MARGIN_USD, srcCurrency)

	const reserved = nativeFee + margin
	const balance = BigInt(srcCurrencyBalance.amount)

	return balance > reserved ? balance - reserved : 0n
}

function sumNativeFees(
	quote: SwapQuote,
	srcCurrency: CurrencyDtoOutput,
): bigint {
	const fees = [quote.quote.blockchainFee]

	if (quote.kind === 'crosschain') fees.push(quote.quote.fee)

	return fees.reduce((sum, fee) => {
		if (fee.currency.id !== srcCurrency.id) return sum

		return sum + BigInt(fee.amount)
	}, 0n)
}

async function renderCheckout(
	telegramId: string,
	draft: CheckoutDraft,
): Promise<HandlerResult<Flow>> {
	const { srcCurrencyBalance, nativeCurrencyBalance, dstCurrency, amountIn } =
		draft

	const amountInDto = toCurrencyAmount(amountIn, srcCurrencyBalance.currency)

	const quote = await fetchSwapQuote(telegramId, amountInDto, dstCurrency)

	return {
		flow: toFlow('swap', 'src-dst-amount-chosen', draft),
		effect: {
			type: EffectType.NAVIGATE,
			page: SwapCheckoutPage.render({
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
	srcChainAddress: ChainAddressDtoOutput,
) {
	const nativeChainAddressDto = nativeChainAddress(srcChainAddress.chain)

	const [srcCurrencyBalance, nativeCurrencyBalance] =
		await balanceCache.getPair(
			telegramId,
			srcChainAddress,
			nativeChainAddressDto,
		)

	return { srcCurrencyBalance, nativeCurrencyBalance }
}

type SwapQuote =
	| { kind: 'crosschain'; quote: QuoteSwapResponseDtoOutput }
	| { kind: 'samechain'; quote: QuoteSwapSamechainResponseDtoOutput }

async function fetchSwapQuote(
	telegramId: string,
	amountIn: CurrencyAmountDtoOutput,
	dstCurrency: CurrencyDtoOutput,
): Promise<SwapQuote> {
	const headers = { 'x-telegram-id': telegramId }
	const body = {
		currencyInChainAddress: amountIn.currency.chainAddress,
		currencyOutChainAddress: dstCurrency.chainAddress,
		amountIn: amountIn.amount,
	}

	if (
		isSameChain(
			currencyToChain(amountIn.currency),
			currencyToChain(dstCurrency),
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
