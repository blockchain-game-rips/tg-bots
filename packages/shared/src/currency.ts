import {
	ChainAddressDto,
	CurrencyAmountDto,
	CurrencyDto,
} from '@rips/api-client'
import { Chain } from '@rips/grammy-kit'

import { formatUnits } from './format/units'

export { formatUnits, parseUnits } from './format/units'

const USD_MIN_DISPLAY = 0.01
const MAX_TOFIXED_DIGITS = 6
const FEE_BASIS = 10000

export interface Expense {
	label: string
	amount: CurrencyAmountDto
}

export interface FundsBreakdownResult {
	lines: string[]
	insufficientAmounts: CurrencyAmountDto[]
}

export function toCurrencyId(currencyChainAddress: ChainAddressDto): string {
	const { address, chain } = currencyChainAddress
	const { namespace, reference } = chain
	return `${namespace}:${reference}:${address}`
}

export function rescaleAmount(
	amount: bigint,
	fromDecimals: number,
	toDecimals: number,
): bigint {
	if (fromDecimals === toDecimals) return amount
	if (toDecimals > fromDecimals)
		return amount * 10n ** BigInt(toDecimals - fromDecimals)
	return amount / 10n ** BigInt(fromDecimals - toDecimals)
}

export function toCurrencyAmount(
	amount: bigint,
	currency: CurrencyDto,
): CurrencyAmountDto {
	return { currency, amount: amount.toString() }
}

// Two variants are provided because callers differ in what they have available:
// findCurrencyIndexById uses a derived string key (more robust across serialization
// boundaries), while findCurrencyIndexByAddress compares fields directly (useful
// when a ChainAddressDto is at hand and no toCurrencyId rip-trip is needed).
export function findCurrencyIndexById(
	currencies: ChainAddressDto[],
	currencyId: string,
): number {
	return currencies.findIndex((c) => toCurrencyId(c) === currencyId)
}

export function findCurrencyIndexByAddress(
	currencies: ChainAddressDto[],
	value: ChainAddressDto,
): number {
	return currencies.findIndex(
		(c) =>
			c.address === value.address &&
			c.chain.reference === value.chain.reference,
	)
}

export function toFixedDigitsFromPrice(priceUsd: number): number {
	if (priceUsd <= 0) return MAX_TOFIXED_DIGITS

	const minTokenAmount = USD_MIN_DISPLAY / priceUsd
	const digits = Math.ceil(-Math.log10(minTokenAmount))

	return Math.min(Math.max(digits, 0), MAX_TOFIXED_DIGITS)
}

export function formatUsd(usd: number): string {
	if (usd === 0) return '$0'
	if (usd < USD_MIN_DISPLAY) return `&lt;$${USD_MIN_DISPLAY.toFixed(2)}`
	return `$${usd.toFixed(2)}`
}

export function formatTokenAmount(amount: number, priceUsd: number): string {
	if (amount === 0) return `0`

	const digits = toFixedDigitsFromPrice(priceUsd)
	const minDisplayAmount = Math.pow(10, -digits)

	if (amount < minDisplayAmount)
		return `&lt;${parseFloat(minDisplayAmount.toFixed(digits)).toString()}`

	return parseFloat(amount.toFixed(digits)).toString()
}

export function currencyAmountDisplayParts(currencyAmount: CurrencyAmountDto): {
	displayAmount: string
	symbol: string
	displayUsdAmount: string
} {
	const { symbol, priceUsd, decimals } = currencyAmount.currency

	const amount = Number(formatUnits(BigInt(currencyAmount.amount), decimals))
	const usd = amount * priceUsd

	return {
		displayAmount: formatTokenAmount(amount, priceUsd),
		symbol,
		displayUsdAmount: formatUsd(usd),
	}
}

export function formatAmountWithUsd(currencyAmount: CurrencyAmountDto): string {
	const { displayAmount, symbol, displayUsdAmount } =
		currencyAmountDisplayParts(currencyAmount)

	return `${displayAmount} ${symbol} (${displayUsdAmount})`
}

export function formatPercent(basisPoints: number): string {
	return `${((basisPoints / FEE_BASIS) * 100).toFixed(2)}%`
}

export function tokenLabel(
	amount: CurrencyAmountDto,
	chainToName: (chain: Chain) => string,
): string {
	const { currency } = amount
	return `${currency.symbol} (${chainToName(currency.chainAddress.chain)})`
}

export function twoLineEntry(
	label: string,
	amount: CurrencyAmountDto,
	suffix = '',
): string[] {
	const { displayAmount, symbol, displayUsdAmount } =
		currencyAmountDisplayParts(amount)
	const indent = ' '.repeat(label.length + 3)

	return [
		`${label}   ${displayAmount} ${symbol}${suffix}`,
		`${indent}${displayUsdAmount}`,
	]
}

export function labelColumnWidth(labels: string[]): number {
	return Math.max(...labels.map((l) => l.length))
}

export function padLabel(label: string, width: number): string {
	return label.padEnd(width)
}

export function insufficientBalanceLines(args: {
	tokenAmount: CurrencyAmountDto
	feeAmount: CurrencyAmountDto
	insufficientAmounts: CurrencyAmountDto[]
	userEvmAddress: string
	feeLabel: string
}): string[] {
	const {
		tokenAmount,
		feeAmount,
		insufficientAmounts,
		userEvmAddress,
		feeLabel,
	} = args

	const tokenInsufficient = insufficientAmounts.some(
		(a) => a.currency.id === tokenAmount.currency.id,
	)

	if (tokenInsufficient) {
		const tokenSymbol = tokenAmount.currency.symbol
		return [
			`⚠️ <b>Insufficient ${tokenSymbol}</b>`,
			'',
			'Enter a smaller amount',
		]
	}

	const feeSymbol = feeAmount.currency.symbol

	return [
		`⚠️ <b>Insufficient ${feeSymbol} for ${feeLabel}</b>`,
		'',
		`Deposit ${feeSymbol} to:`,
		`<code>${userEvmAddress}</code>`,
		'',
		'Then press Update',
	]
}

export function insufficientFundsDepositLines(
	userEvmAddress: string,
): string[] {
	return [
		`⚠️ <b>Insufficient funds</b>`,
		'',
		'Deposit to:',
		`<code>${userEvmAddress}</code>`,
		'',
		'Then press Update',
	]
}

export function fundsBreakdown(
	expenses: Expense[],
	balances: CurrencyAmountDto[],
	chainToName: (chain: Chain) => string,
): FundsBreakdownResult {
	const expenseLabels = expenses.map(({ label }) => label)

	const uniqueBalances = balances.filter(
		(b, i, arr) =>
			arr.findIndex((x) => x.currency.id === b.currency.id) === i,
	)
	const balanceLabels = uniqueBalances.map((b) => b.currency.symbol)

	const labelWidth = labelColumnWidth([...expenseLabels, ...balanceLabels])

	const expenseLines = expenses.flatMap(({ amount, label }) =>
		twoLineEntry(padLabel(label, labelWidth), amount),
	)

	const insufficientAmounts: CurrencyAmountDto[] = []

	const balanceLines = uniqueBalances.flatMap((balance) => {
		const totalRequired = expenses.reduce((sum, { amount }) => {
			if (amount.currency.id !== balance.currency.id) return sum
			return sum + BigInt(amount.amount)
		}, 0n)

		const insufficient = BigInt(balance.amount) < totalRequired
		if (insufficient) insufficientAmounts.push(balance)

		const suffix = insufficient ? ' ⚠️' : ''

		return twoLineEntry(
			padLabel(balance.currency.symbol, labelWidth),
			balance,
			suffix,
		)
	})

	const firstExpense = expenses[0]

	if (firstExpense === undefined) throw new Error('No expenses provided')

	const firstChain = firstExpense.amount.currency.chainAddress.chain
	const chainName = chainToName(firstChain)
	const chainPrefix = '⛓ '
	const chainLabel = padLabel('Chain', labelWidth - chainPrefix.length)
	const chainLine = `${chainPrefix}${chainLabel}   ${chainName}`

	const allLines = [
		chainLine,
		'💸 Costs',
		...expenseLines,
		'💼 Balance',
		...balanceLines,
	]
	const maxWidth = Math.max(...allLines.map((l) => l.length))
	const divider = '─'.repeat(maxWidth)

	const block = [
		chainLine,
		divider,
		'💸 Costs',
		'',
		...expenseLines,
		divider,
		'💼 Balance',
		'',
		...balanceLines,
	].join('\n')

	return { lines: [`<pre>${block}</pre>`], insufficientAmounts }
}
