import { CurrencyAmountDto } from '../../../generated/api-client'
import { chainToName } from '../chain'
import { currencyAmountDisplayParts } from '../format/currency'

export interface Expense {
	label: string
	amount: CurrencyAmountDto
}

export interface FundsBreakdownResult {
	lines: string[]
	insufficientAmounts: CurrencyAmountDto[]
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
