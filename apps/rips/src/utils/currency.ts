import {
	ChainAddressDto,
	CurrencyAmountDto,
	CurrencyDto,
} from '../../generated/api-client'
import { SUPPORTED_CURRENCIES } from '../constants'
import { chainToName } from './chain'
import { formatUnits } from './units'
export { formatUnits, parseUnits } from './units'

const USD_MIN_DISPLAY = 0.01

export type Expense = {
	label: string
	amount: CurrencyAmountDto
}

export type FundsBreakdownResult = {
	lines: string[]
	insufficientAmounts: CurrencyAmountDto[]
}

function tokenDecimalsFromPrice(priceUsd: number): number {
	const minTokenAmount = USD_MIN_DISPLAY / priceUsd
	return Math.ceil(-Math.log10(minTokenAmount))
}

function formatUsd(usd: number): string {
	if (usd === 0) return '$0'
	if (usd < USD_MIN_DISPLAY) return `<$${USD_MIN_DISPLAY.toFixed(2)}`
	return `$${usd.toFixed(2)}`
}

export function findCurrencyIndex(currencyId: string): number {
	return SUPPORTED_CURRENCIES.findIndex((c) => toCurrencyId(c) === currencyId)
}

export function toCurrencyId(currencyChainAddress: ChainAddressDto) {
	const { address, chain } = currencyChainAddress

	const { namespace, reference } = chain

	return `${namespace}:${reference}:${address}`
}

function formatTokenAmount(amount: number, priceUsd: number): string {
	if (amount === 0) return `0`

	const decimals = tokenDecimalsFromPrice(priceUsd)
	const minDisplayAmount = Math.pow(10, -decimals)

	if (amount < minDisplayAmount)
		return `<${parseFloat(minDisplayAmount.toFixed(decimals))}`

	return `${parseFloat(amount.toFixed(decimals))}`
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

export function chainAddressToString(chainAddress: ChainAddressDto): string {
	return `${chainAddress.chain.namespace}:${chainAddress.chain.reference}:${chainAddress.address}`
}

function twoLineEntry(
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

function labelColumnWidth(labels: string[]): number {
	return Math.max(...labels.map((l) => l.length))
}

function padLabel(label: string, width: number): string {
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

	const firstChain = expenses[0].amount.currency.chainAddress.chain
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
