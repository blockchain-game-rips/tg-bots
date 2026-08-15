import {
	AvailablePresetDtoOutput,
	CurrencyAmountDtoOutput,
	QuotePurchaseResponseDtoOutput,
	QuoteZapResponseDtoOutput,
	QuoteZapSamechainResponseDtoOutput,
} from '@rips/api-client'
import {
	buildActionData,
	fmt,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import {
	configName,
	findInsufficientBalances,
	formatAmountWithUsd,
	resolveConfig,
	toShortDurationFormat,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import * as labels from '../../utils/button-labels'
import { currencyToChainName } from '../../utils/chain'
import { enterBreadcrumb } from '../../utils/display/breadcrumb'

const TRANSACTION_SEND_OVERHEAD_SECONDS = 4
const MILLISECONDS_PER_SECOND = 1000

const RECEIVE_CHAIN_NAME = 'Base'

// Direct entry pays Base ETH straight into the game; the entry total is derived
// from the preset price, so amountIn is supplied alongside the purchase quote.
interface DirectQuote {
	kind: 'direct'
	amountIn: CurrencyAmountDtoOutput
	quote: QuotePurchaseResponseDtoOutput
}

interface SamechainQuote {
	kind: 'samechain'
	quote: QuoteZapSamechainResponseDtoOutput
}

interface CrosschainQuote {
	kind: 'crosschain'
	quote: QuoteZapResponseDtoOutput
}

export type CheckoutQuote = DirectQuote | SamechainQuote | CrosschainQuote

interface CheckoutArgs {
	availablePreset: AvailablePresetDtoOutput
	entryCount: number
	srcBalance: CurrencyAmountDtoOutput
	nativeBalance: CurrencyAmountDtoOutput
	quote: CheckoutQuote
}

export const CheckoutPage = {
	render(args: CheckoutArgs): PageContent {
		const insufficientAmounts = findInsufficientBalances(
			expenseAmounts(args.quote),
			[args.srcBalance, args.nativeBalance],
		)

		return {
			message: buildMessage(args, insufficientAmounts),
			keyboard: buildKeyboard(insufficientAmounts, args.quote),
		}
	},
}

function isDirect(quote: CheckoutQuote): quote is DirectQuote {
	return quote.kind === 'direct'
}

function isCrosschain(quote: CheckoutQuote): quote is CrosschainQuote {
	return quote.kind === 'crosschain'
}

function isSufficient(insufficientAmounts: CurrencyAmountDtoOutput[]): boolean {
	return insufficientAmounts.length === 0
}

function entryTotalAmount(quote: CheckoutQuote): CurrencyAmountDtoOutput {
	return isDirect(quote) ? quote.amountIn : quote.quote.amountIn
}

function expenseAmounts(quote: CheckoutQuote): CurrencyAmountDtoOutput[] {
	const entryTotal = entryTotalAmount(quote)
	const networkFee = quote.quote.blockchainFee

	if (!isCrosschain(quote)) return [entryTotal, networkFee]

	return [entryTotal, quote.quote.fee, networkFee]
}

function buildMessage(
	args: CheckoutArgs,
	insufficientAmounts: CurrencyAmountDtoOutput[],
): FormattedString {
	const { availablePreset, entryCount, srcBalance, quote } = args

	const config = resolveConfig(availablePreset)
	const srcChainName = currencyToChainName(srcBalance.currency)

	const lines: Line[] = [
		enterBreadcrumb(configName(config)),
		'',
		...headerLines(quote),
		`Pay from: ${srcChainName} ${srcBalance.currency.symbol}`,
		...receiveLine(quote),
		`Entries: ${entryCount.toString()}`,
		`Entry total: ${formatAmountWithUsd(entryTotalAmount(quote))}`,
		'',
		...costLines(quote),
		`Your ${srcChainName} balance:`,
		formatAmountWithUsd(srcBalance),
		...insufficientLines(args, insufficientAmounts),
	]

	return joinLines(lines)
}

function headerLines(quote: CheckoutQuote): Line[] {
	if (!isCrosschain(quote)) return []

	return ['🌉 Bridge & Enter', '']
}

function receiveLine(quote: CheckoutQuote): Line[] {
	if (!isCrosschain(quote)) return []

	return [`Receive on: ${RECEIVE_CHAIN_NAME}`]
}

function costLines(quote: CheckoutQuote): Line[] {
	const lines: Line[] = []

	if (isCrosschain(quote)) {
		lines.push(
			'Estimated bridge/swap cost:',
			formatAmountWithUsd(quote.quote.fee),
			'',
		)
	}

	lines.push(
		'Estimated network fee:',
		formatAmountWithUsd(quote.quote.blockchainFee),
		'',
	)

	if (isCrosschain(quote)) {
		const seconds =
			quote.quote.durationMs / MILLISECONDS_PER_SECOND +
			TRANSACTION_SEND_OVERHEAD_SECONDS

		lines.push('Estimated time:', toShortDurationFormat(seconds), '')
	}

	return lines
}

function insufficientLines(
	args: CheckoutArgs,
	insufficientAmounts: CurrencyAmountDtoOutput[],
): Line[] {
	if (isSufficient(insufficientAmounts)) return []

	const allExpenseAmounts = expenseAmounts(args.quote)

	const blocks = insufficientAmounts.flatMap((balance) =>
		insufficientCurrencyBlock(balance, allExpenseAmounts),
	)

	return ['', ...blocks, 'Deposit or pay with another token.']
}

function insufficientCurrencyBlock(
	balance: CurrencyAmountDtoOutput,
	allExpenseAmounts: CurrencyAmountDtoOutput[],
): Line[] {
	const { currency } = balance
	const chainName = currencyToChainName(currency)

	const required = allExpenseAmounts.reduce((sum, expense) => {
		if (expense.currency.id !== currency.id) return sum

		return sum + BigInt(expense.amount)
	}, 0n)

	const requiredAmount: CurrencyAmountDtoOutput = {
		currency,
		amount: required.toString(),
	}

	return [
		fmt`⚠️ ${FormattedString.b(`Not enough ${currency.symbol} on ${chainName}`)}`,
		`Required: ${formatAmountWithUsd(requiredAmount)}`,
		`Available: ${formatAmountWithUsd(balance)}`,
		'',
	]
}

function buildKeyboard(
	insufficientAmounts: CurrencyAmountDtoOutput[],
	quote: CheckoutQuote,
): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	if (isSufficient(insufficientAmounts)) {
		const buttonText = isCrosschain(quote)
			? labels.CONFIRM_BRIDGE_AND_ENTER
			: labels.CONFIRM_ENTRY

		keyboard
			.text(
				buttonText,
				buildActionData(actionIds.executeEnter, undefined),
			)
			.row()
	} else {
		for (const balance of insufficientAmounts) {
			const { currency } = balance
			const chainName = currencyToChainName(currency)

			keyboard
				.text(
					labels.depositListRowLabel(chainName, currency.symbol),
					buildActionData(
						actionIds.openDepositAddress,
						currency.chainAddress,
					),
				)
				.row()
		}
	}

	keyboard
		.text(
			labels.UPDATE_BALANCE_AND_QUOTE,
			buildActionData(actionIds.refreshEnterCheckout, undefined),
		)
		.row()
		.text(
			labels.CHANGE_ENTRY_COUNT,
			buildActionData(
				actionIds.openEnterChooseEntryCountFromCheckout,
				undefined,
			),
		)
		.row()
		.text(
			labels.CHANGE_PAYMENT_TOKEN,
			buildActionData(actionIds.openEnterPaymentOptions, undefined),
		)
		.row()
		.appendHomeButton()

	return keyboard
}
