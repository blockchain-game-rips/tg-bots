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
import { EffectType, HandlerResult, PageContent } from '../../../types'
import { balanceCache } from '../../../cache/balance-cache'
import { currencyCache } from '../../../cache/currency-cache'
import { AmountPayload, amountCodec } from '../../../utils/codecs'
import { currencyChainAddressCodec } from '../../../utils/currency'

/** Only what the user chose — every balance is read fresh at render time. */
interface CheckoutDraft {
	srcChainAddress: ChainAddressDtoOutput
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
			srcChainAddress: prevSrcChainAddress,
		} = session.flow.data

		const [prevSrcCurrency, srcCurrency] = await Promise.all([
			currencyCache.getOne(prevSrcChainAddress),
			currencyCache.getOne(srcChainAddress),
		])

		const rescaledAmountIn = rescaleAmount(
			amountIn,
			prevSrcCurrency.decimals,
			srcCurrency.decimals,
		)

		return renderCheckout(session.telegramId, {
			srcChainAddress,
			dstCurrency,
			amountIn: rescaledAmountIn,
		})
	})

export const openSwapCheckoutFromDst: ActionDef<ChainAddressDtoOutput> =
	withPayload(currencyChainAddressCodec, async (session, dstChainAddress) => {
		assertFlow(session, 'swap', 'src-dst-amount-chosen')

		const { srcChainAddress, amountIn } = session.flow.data

		const dstCurrency = await currencyCache.getOne(dstChainAddress)

		return renderCheckout(session.telegramId, {
			srcChainAddress,
			dstCurrency,
			amountIn,
		})
	})

export const openSwapCheckoutFromAmount: ActionDef<AmountPayload> = withPayload(
	amountCodec,
	async (session, amountPayload) => {
		assertFlow(session, 'swap', 'src-dst-chosen', 'src-dst-amount-chosen')

		const { srcChainAddress, dstCurrency } = session.flow.data

		const srcCurrencyBalance = await balanceCache.getOne(
			session.telegramId,
			srcChainAddress,
		)

		const amountIn = await resolveAmountIn(
			session.telegramId,
			amountPayload,
			srcCurrencyBalance,
			dstCurrency,
		)

		return renderCheckout(session.telegramId, {
			srcChainAddress,
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

/**
 * Reads balances through the cache on every render, so a replay of this handler
 * from the back trail cannot show what the balances were when it first ran.
 */
async function renderCheckout(
	telegramId: string,
	draft: CheckoutDraft,
): Promise<HandlerResult<Flow>> {
	return {
		flow: toFlow('swap', 'src-dst-amount-chosen', draft),
		effect: {
			type: EffectType.NAVIGATE,
			page: await renderSwapCheckoutPage(telegramId, draft),
		},
	}
}

export async function renderSwapCheckoutPage(
	telegramId: string,
	draft: CheckoutDraft,
): Promise<PageContent> {
	const { srcChainAddress, dstCurrency, amountIn } = draft

	const [srcCurrencyBalance, nativeCurrencyBalance] =
		await balanceCache.getPair(
			telegramId,
			srcChainAddress,
			nativeChainAddress(srcChainAddress.chain),
		)

	const amountInDto = toCurrencyAmount(amountIn, srcCurrencyBalance.currency)

	const quote = await fetchSwapQuote(telegramId, amountInDto, dstCurrency)

	return SwapCheckoutPage.render({
		srcBalance: srcCurrencyBalance,
		nativeBalance: nativeCurrencyBalance,
		dstCurrency,
		amountIn,
		quote,
	})
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
