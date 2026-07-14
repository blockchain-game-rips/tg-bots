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
import { parseCurrencyAmount, parseUnits } from '@rips/shared'
import { ActionDef, noPayload, withPayload } from '../../../action-def'
import { isNativeChainAddress, nativeChainAddress } from '../../../constants'
import { Flow, toFlow } from '../../../flows'
import { SwapCheckoutPage } from '../../../pages/swap/swap-checkout-page'
import { Chain, EffectType, HandlerResult } from '../../../types'
import {
	fetchBalances,
	fetchCurrency,
	getBalance,
} from '../../../utils/api/wrappers'
import { SwapAmountPayload, swapAmountCodec } from '../../../utils/codecs'
import { currencyChainAddressCodec } from '../../../utils/currency'

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

export const openSwapCheckoutFromAmount: ActionDef<SwapAmountPayload> =
	withPayload(swapAmountCodec, async (session, amountPayload) => {
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
	})

async function resolveAmountIn(
	telegramId: string,
	amountPayload: SwapAmountPayload,
	srcCurrencyBalance: CurrencyAmountDto,
	dstCurrency: CurrencyDto,
): Promise<CurrencyAmountDto> {
	const srcCurrency = srcCurrencyBalance.currency

	if (amountPayload.kind === 'exact') {
		return parseCurrencyAmount(String(amountPayload.value), srcCurrency)
	}

	if (!isNativeChainAddress(srcCurrency.chainAddress)) {
		return srcCurrencyBalance
	}

	return resolveNativeMaxAmount(telegramId, srcCurrencyBalance, dstCurrency)
}

const NATIVE_MAX_MARGIN_USD = 0.1

async function resolveNativeMaxAmount(
	telegramId: string,
	srcCurrencyBalance: CurrencyAmountDto,
	dstCurrency: CurrencyDto,
): Promise<CurrencyAmountDto> {
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
	const spendable = balance > reserved ? balance - reserved : 0n

	return { currency: srcCurrency, amount: spendable.toString() }
}

function usdToTokenUnits(usd: number, currency: CurrencyDto): bigint {
	if (currency.priceUsd <= 0) return 0n

	const tokenAmount = usd / currency.priceUsd

	return parseUnits(tokenAmount.toFixed(currency.decimals), currency.decimals)
}

function sumNativeFees(quote: SwapQuote, srcCurrency: CurrencyDto): bigint {
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
