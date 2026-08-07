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
	Expense,
	formatAmountWithUsd,
	fundsBreakdown,
	resolveConfig,
	toShortDurationFormat,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
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

type CheckoutQuote = DirectQuote | SamechainQuote | CrosschainQuote

interface CheckoutArgs {
	availablePreset: AvailablePresetDtoOutput
	entryCount: number
	srcBalance: CurrencyAmountDtoOutput
	nativeBalance: CurrencyAmountDtoOutput
	quote: CheckoutQuote
}

export const CheckoutPage = {
	render(args: CheckoutArgs): PageContent {
		const insufficientAmounts = findInsufficientBalances(args)

		return {
			message: buildMessage(args, insufficientAmounts),
			keyboard: buildKeyboard(args, insufficientAmounts),
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

function expenses(quote: CheckoutQuote): Expense[] {
	const entryTotal: Expense = {
		label: 'Entry total',
		amount: entryTotalAmount(quote),
	}

	const networkFee: Expense = {
		label: 'Network fee',
		amount: quote.quote.blockchainFee,
	}

	if (!isCrosschain(quote)) return [entryTotal, networkFee]

	const bridgeSwapCost: Expense = {
		label: 'Bridge/swap cost',
		amount: quote.quote.fee,
	}

	return [entryTotal, bridgeSwapCost, networkFee]
}

function findInsufficientBalances(
	args: CheckoutArgs,
): CurrencyAmountDtoOutput[] {
	const { srcBalance, nativeBalance, quote } = args

	const { insufficientAmounts } = fundsBreakdown(expenses(quote), [
		srcBalance,
		nativeBalance,
	])

	return insufficientAmounts
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
	if (isDirect(quote)) return []

	return ['🌉 Bridge & Enter', '']
}

function receiveLine(quote: CheckoutQuote): Line[] {
	if (isDirect(quote)) return []

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

	const allExpenses = expenses(args.quote)

	const blocks = insufficientAmounts.flatMap((balance) =>
		insufficientCurrencyBlock(balance, allExpenses),
	)

	return ['', ...blocks, 'Enter from another chain or deposit.']
}

function insufficientCurrencyBlock(
	balance: CurrencyAmountDtoOutput,
	allExpenses: Expense[],
): Line[] {
	const { currency } = balance
	const chainName = currencyToChainName(currency)

	const required = allExpenses.reduce((sum, { amount }) => {
		if (amount.currency.id !== currency.id) return sum

		return sum + BigInt(amount.amount)
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
	args: CheckoutArgs,
	insufficientAmounts: CurrencyAmountDtoOutput[],
): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	if (isSufficient(insufficientAmounts)) {
		keyboard.text('Confirm', confirmActionData(args.quote)).row()
	} else {
		for (const balance of insufficientAmounts) {
			const { currency } = balance
			const chainName = currencyToChainName(currency)

			// TODO: deposit back-nav should return to this checkout,
			// not the deposit flow's choose-token step.
			keyboard
				.text(
					`Deposit ${chainName} ${currency.symbol}`,
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
			'Change payment token',
			buildActionData(actionIds.openEnterPaymentOptions, undefined),
		)
		.row()
		.appendHomeButton()

	return keyboard
}

function confirmActionData(quote: CheckoutQuote): string {
	if (isDirect(quote)) {
		return buildActionData(actionIds.executeEnter, undefined)
	}

	return buildActionData(actionIds.executeZap, undefined)
}
