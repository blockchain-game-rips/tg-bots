import {
	CurrencyAmountDto,
	CurrencyDto,
	QuoteSwapResponseDtoOutput,
	QuoteSwapSamechainResponseDtoOutput,
} from '@rips/api-client'
import {
	buildActionData,
	fmt,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import {
	currencyAmountDisplayParts,
	Expense,
	formatAmountWithUsd,
	fundsBreakdown,
	toCurrencyAmount,
	toShortDurationFormat,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { currencyToChainName } from '../../utils/chain'
import { swapBreadcrumb } from '../../utils/display/breadcrumb'

export const SwapCheckoutPage = {
	render(args: CheckoutArgs): PageContent {
		const resolved: ResolvedArgs = {
			...args,
			amountIn: toCurrencyAmount(args.amountIn, args.srcBalance.currency),
		}

		const insufficientAmounts = findInsufficientBalances(resolved)

		return {
			message: buildMessage(resolved, insufficientAmounts),
			keyboard: buildKeyboard(resolved, insufficientAmounts),
		}
	},
}

interface CrosschainQuote {
	kind: 'crosschain'
	quote: QuoteSwapResponseDtoOutput
}

interface SamechainQuote {
	kind: 'samechain'
	quote: QuoteSwapSamechainResponseDtoOutput
}

type SwapQuote = CrosschainQuote | SamechainQuote

interface CheckoutArgs {
	srcBalance: CurrencyAmountDto
	nativeBalance: CurrencyAmountDto
	dstCurrency: CurrencyDto
	amountIn: bigint
	quote: SwapQuote
}

type ResolvedArgs = Omit<CheckoutArgs, 'amountIn'> & {
	amountIn: CurrencyAmountDto
}

function buildMessage(
	args: ResolvedArgs,
	insufficientAmounts: CurrencyAmountDto[],
): FormattedString {
	const { srcBalance, dstCurrency, amountIn, quote } = args

	const srcChainName = currencyToChainName(srcBalance.currency)
	const dstChainName = currencyToChainName(dstCurrency)

	const lines: Line[] = [
		swapBreadcrumb(),
		'',
		`From: ${srcChainName} ${srcBalance.currency.symbol}`,
		`To: ${dstChainName} ${dstCurrency.symbol}`,
		`Amount: ${formatAmount(amountIn)}`,
		'',
		'You receive approximately:',
		formatAmountWithUsd(quote.quote.amountOut),
		'',
		...estimatedTimeLines(quote),
		...feeLines(quote),
		`Your ${srcChainName} balance:`,
		formatAmount(srcBalance),
		...insufficientLines(args, insufficientAmounts),
	]

	return joinLines(lines)
}

function findInsufficientBalances(args: ResolvedArgs): CurrencyAmountDto[] {
	const { srcBalance, nativeBalance, amountIn, quote } = args

	const expenses: Expense[] = [
		{ label: 'Amount', amount: amountIn },
		...feeExpenses(quote),
	]

	const { insufficientAmounts } = fundsBreakdown(expenses, [
		srcBalance,
		nativeBalance,
	])

	return insufficientAmounts
}

function isSufficientAmounts(insufficientAmounts: CurrencyAmountDto[]) {
	return insufficientAmounts.length === 0
}

function feeExpenses(quote: SwapQuote): Expense[] {
	const networkFee: Expense = {
		label: 'Network fee',
		amount: quote.quote.blockchainFee,
	}

	if (isSamechain(quote)) return [networkFee]

	const bridgeFee: Expense = {
		label: 'Bridge/swap fee',
		amount: quote.quote.fee,
	}

	return [bridgeFee, networkFee]
}

function insufficientLines(
	args: ResolvedArgs,
	insufficientAmounts: CurrencyAmountDto[],
): Line[] {
	if (isSufficientAmounts(insufficientAmounts)) return []

	const { amountIn, nativeBalance } = args

	const amountInInsufficient = insufficientAmounts.some(
		(balance) => balance.currency.id === amountIn.currency.id,
	)

	if (amountInInsufficient) {
		return [
			'',
			fmt`⚠️ ${FormattedString.b(`Not enough ${currencyLabel(amountIn.currency)}`)}`,
			'',
			'Enter a smaller amount.',
		]
	}

	return [
		'',
		fmt`⚠️ ${FormattedString.b(`Not enough ${currencyLabel(nativeBalance.currency)} to cover fee`)}`,
		'',
		`Your ${currencyLabel(nativeBalance.currency)} balance: ${formatAmount(nativeBalance)}`,
	]
}

const MILLISECONDS_PER_SECOND = 1000

function estimatedTimeLines(quote: SwapQuote): string[] {
	if (isSamechain(quote)) return []

	const seconds = quote.quote.durationMs / MILLISECONDS_PER_SECOND

	return ['Estimated time:', toShortDurationFormat(seconds), '']
}

function isSamechain(quote: SwapQuote): quote is SamechainQuote {
	if (quote.kind === 'samechain') return true

	return false
}

function feeLines(quote: SwapQuote): string[] {
	const networkFeeLine = `Network fee: ${formatAmountWithUsd(quote.quote.blockchainFee)}`

	if (isSamechain(quote)) {
		return ['Fees:', networkFeeLine, '']
	}

	const bridgeFeeLine = `Bridge/swap fee: ${formatAmountWithUsd(quote.quote.fee)}`

	return ['Fees:', bridgeFeeLine, networkFeeLine, '']
}

function currencyLabel(currency: CurrencyDto): string {
	return `${currencyToChainName(currency)} ${currency.symbol}`
}

function formatAmount(amount: CurrencyAmountDto): string {
	const { displayAmount, symbol } = currencyAmountDisplayParts(amount)

	return `${displayAmount} ${symbol}`
}

function buildKeyboard(
	args: ResolvedArgs,
	insufficientAmounts: CurrencyAmountDto[],
): InlineKeyboard {
	const { srcBalance, dstCurrency } = args

	const keyboard = new InlineKeyboard()

	if (isSufficientAmounts(insufficientAmounts)) {
		keyboard
			.text('Confirm', buildActionData(actionIds.executeSwap, undefined))
			.row()
	}

	return keyboard
		.text(
			'Change Amount',
			buildActionData(
				actionIds.openSwapChooseAmount,
				dstCurrency.chainAddress,
			),
		)
		.row()
		.text(
			'Change Destination',
			buildActionData(
				actionIds.openSwapChooseDstChain,
				srcBalance.currency.chainAddress,
			),
		)
		.row()
		.text(
			'Change Source',
			buildActionData(actionIds.openSwapChooseSrcChain, undefined),
		)
		.row()
		.appendHomeButton()
}
