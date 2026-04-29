import { CurrencyAmountDto } from '../../generated/api-client'
import { SUPPORTED_CHAINS } from '../constants'
import { formatUnits, toUsd } from '../utils/units'

export type Expense = {
	label: string
	amount: CurrencyAmountDto
}

function formatCryptoAmount(amount: CurrencyAmountDto): string {
	const formattedAmount = formatUnits(
		BigInt(amount.amount),
		amount.currency.decimals,
	)

	return `${formattedAmount} ${amount.currency.symbol}`
}

function twoLineEntry(
	label: string,
	cryptoAmount: string,
	usdAmount: string,
	suffix = '',
): string[] {
	const indent = ' '.repeat(label.length + 3)

	return [`${label}   ${cryptoAmount}${suffix}`, `${indent}${usdAmount}`]
}

function labelColumnWidth(labels: string[]): number {
	return Math.max(...labels.map((l) => l.length))
}

function padLabel(label: string, width: number): string {
	return label.padEnd(width)
}

export function fundsBreakdown(
	expenses: Expense[],
	balances: CurrencyAmountDto[],
): string[] {
	const expenseLabels = expenses.map(({ label }) => label)
	const uniqueBalances = balances.filter(
		(b, i, arr) =>
			arr.findIndex((x) => x.currency.id === b.currency.id) === i,
	)
	const balanceLabels = uniqueBalances.map((b) => b.currency.symbol)

	const costsWidth = labelColumnWidth(expenseLabels)
	const balanceWidth = labelColumnWidth(balanceLabels)

	const expenseLines = expenses.flatMap(({ amount, label }) =>
		twoLineEntry(
			padLabel(label, costsWidth),
			formatCryptoAmount(amount),
			toUsd(amount),
		),
	)

	const balanceLines = uniqueBalances.flatMap((balance) => {
		const totalRequired = expenses.reduce((sum, { amount }) => {
			if (amount.currency.id !== balance.currency.id) return sum
			return sum + BigInt(amount.amount)
		}, 0n)

		const insufficient = BigInt(balance.amount) < totalRequired
		const suffix = insufficient ? ' ⚠️' : ''

		return twoLineEntry(
			padLabel(balance.currency.symbol, balanceWidth),
			formatCryptoAmount(balance),
			toUsd(balance),
			suffix,
		)
	})

	const firstChain = expenses[0].amount.currency.chainAddress.chain
	const chainName =
		SUPPORTED_CHAINS.find(
			(c) =>
				c.reference === firstChain.reference &&
				c.namespace === firstChain.namespace,
		)?.name ?? firstChain.reference

	const allLines = [
		`⛓ Chain   ${chainName}`,
		'💸 Costs',
		...expenseLines,
		'💼 Balance',
		...balanceLines,
	]
	const maxWidth = Math.max(...allLines.map((l) => l.length))
	const divider = '─'.repeat(maxWidth)

	const block = [
		`⛓ Chain   ${chainName}`,
		divider,
		'💸 Costs',
		'',
		...expenseLines,
		divider,
		'💼 Balance',
		'',
		...balanceLines,
	].join('\n')

	return [`<pre>${block}</pre>`]
}

type Duration = {
	days: number
	hours: number
	minutes: number
	seconds: number
}

const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600
const SECONDS_PER_DAY = 86400

function parseDuration(totalSeconds: number): Duration {
	const days = Math.floor(totalSeconds / SECONDS_PER_DAY)
	const hours = Math.floor(
		(totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR,
	)
	const minutes = Math.floor(
		(totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE,
	)
	const seconds = totalSeconds % SECONDS_PER_MINUTE

	return { days, hours, minutes, seconds }
}

/**
 * @returns string in format `${days}d ${hours}h ${minutes}m ${seconds}s`
 */
export function toShortDurationFormat(seconds: number) {
	const duration = parseDuration(seconds)

	return [
		duration.days > 0 ? `${duration.days}d` : null,
		duration.hours > 0 ? `${duration.hours}h` : null,
		duration.minutes > 0 ? `${duration.minutes}m` : null,
		duration.seconds > 0 ? `${duration.seconds}s` : null,
	]
		.filter(Boolean)
		.join(' ')
}

/**
 * @returns string in format `${days}days ${hours}hours ${minutes}minutes ${seconds}seconds`
 */
export function toLongDurationFormat(seconds: number) {
	const duration = parseDuration(seconds)

	return [
		duration.days > 0 ? `${duration.days}days` : null,
		duration.hours > 0 ? `${duration.hours}hours` : null,
		duration.minutes > 0 ? `${duration.minutes}minutes` : null,
		duration.seconds > 0 ? `${duration.seconds}seconds` : null,
	]
		.filter(Boolean)
		.join(' ')
}
