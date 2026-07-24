import {
	AvailablePresetDto,
	CurrencyAmountDto,
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
import { chainToName } from '../../utils/chain'
import { buyEntriesBreadcrumb } from '../../utils/display/breadcrumb'

const TRANSACTION_SEND_OVERHEAD_SECONDS = 4
const MILLISECONDS_PER_SECOND = 1000

const RECEIVE_CHAIN_NAME = 'Base'

interface CrosschainQuote {
	kind: 'crosschain'
	quote: QuoteZapResponseDtoOutput
}

interface SamechainQuote {
	kind: 'samechain'
	quote: QuoteZapSamechainResponseDtoOutput
}

type ZapQuote = CrosschainQuote | SamechainQuote

interface CheckoutArgs {
	availablePreset: AvailablePresetDto
	entryCount: number
	srcBalance: CurrencyAmountDto
	nativeBalance: CurrencyAmountDto
	quote: ZapQuote
}

export const ZapCheckoutPage = {
	render(args: CheckoutArgs): PageContent {
		const insufficientAmounts = findInsufficientBalances(args)

		return {
			message: buildMessage(args, insufficientAmounts),
			keyboard: buildKeyboard(insufficientAmounts),
		}
	},
}

function isSamechain(quote: ZapQuote): quote is SamechainQuote {
	return quote.kind === 'samechain'
}

function isSufficient(insufficientAmounts: CurrencyAmountDto[]): boolean {
	return insufficientAmounts.length === 0
}

function expenses(quote: ZapQuote): Expense[] {
	const entryTotal: Expense = {
		label: 'Entry total',
		amount: quote.quote.amountIn,
	}

	const networkFee: Expense = {
		label: 'Network fee',
		amount: quote.quote.blockchainFee,
	}

	if (isSamechain(quote)) return [entryTotal, networkFee]

	const bridgeSwapCost: Expense = {
		label: 'Bridge/swap cost',
		amount: quote.quote.fee,
	}

	return [entryTotal, bridgeSwapCost, networkFee]
}

function findInsufficientBalances(args: CheckoutArgs): CurrencyAmountDto[] {
	const { srcBalance, nativeBalance, quote } = args

	const { insufficientAmounts } = fundsBreakdown(expenses(quote), [
		srcBalance,
		nativeBalance,
	])

	return insufficientAmounts
}

function buildMessage(
	args: CheckoutArgs,
	insufficientAmounts: CurrencyAmountDto[],
): FormattedString {
	const { availablePreset, entryCount, srcBalance, quote } = args

	const config = resolveConfig(availablePreset)
	const srcChainName = chainToName(srcBalance.currency.chainAddress.chain)

	const lines: Line[] = [
		buyEntriesBreadcrumb(configName(config)),
		'',
		'🌉 Bridge & Enter',
		'',
		`Pay from: ${srcChainName} ${srcBalance.currency.symbol}`,
		`Receive on: ${RECEIVE_CHAIN_NAME}`,
		`Entries: ${entryCount.toString()}`,
		`Entry total: ${formatAmountWithUsd(quote.quote.amountIn)}`,
		'',
		...costLines(quote),
		`Your ${srcChainName} balance:`,
		formatAmountWithUsd(srcBalance),
		...insufficientLines(args, insufficientAmounts),
	]

	return joinLines(lines)
}

function costLines(quote: ZapQuote): Line[] {
	const lines: Line[] = []

	if (!isSamechain(quote)) {
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

	if (!isSamechain(quote)) {
		const seconds =
			quote.quote.durationMs / MILLISECONDS_PER_SECOND +
			TRANSACTION_SEND_OVERHEAD_SECONDS

		lines.push('Estimated time:', toShortDurationFormat(seconds), '')
	}

	return lines
}

function insufficientLines(
	args: CheckoutArgs,
	insufficientAmounts: CurrencyAmountDto[],
): Line[] {
	if (isSufficient(insufficientAmounts)) return []

	const allExpenses = expenses(args.quote)

	const blocks = insufficientAmounts.flatMap((balance) =>
		insufficientCurrencyBlock(balance, allExpenses),
	)

	return ['', ...blocks, 'Choose another token or deposit.']
}

function insufficientCurrencyBlock(
	balance: CurrencyAmountDto,
	allExpenses: Expense[],
): Line[] {
	const { currency } = balance
	const chainName = chainToName(currency.chainAddress.chain)

	const required = allExpenses.reduce((sum, { amount }) => {
		if (amount.currency.id !== currency.id) return sum

		return sum + BigInt(amount.amount)
	}, 0n)

	const requiredAmount: CurrencyAmountDto = {
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
	insufficientAmounts: CurrencyAmountDto[],
): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	if (isSufficient(insufficientAmounts)) {
		keyboard
			.text('Confirm', buildActionData(actionIds.executeZap, undefined))
			.row()
	} else {
		for (const balance of insufficientAmounts) {
			const { currency } = balance
			const chainName = chainToName(currency.chainAddress.chain)

			// TODO: deposit back-nav should return to this zap checkout,
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
			'Choose Another Token',
			buildActionData(actionIds.openZapChooseChain, undefined),
		)
		.row()
		.appendHomeButton()

	return keyboard
}
