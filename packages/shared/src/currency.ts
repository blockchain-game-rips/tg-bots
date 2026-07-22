import {
	ChainAddressDto,
	CurrencyAmountDto,
	CurrencyDto,
} from '@rips/api-client'
import { fmt, FormattedString } from '@rips/grammy-kit'

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
	if (usd < USD_MIN_DISPLAY) return `<$${USD_MIN_DISPLAY.toFixed(2)}`
	return `$${usd.toFixed(2)}`
}

export function formatTokenAmount(amount: number, priceUsd: number): string {
	if (amount === 0) return `0`

	const digits = toFixedDigitsFromPrice(priceUsd)
	const minDisplayAmount = Math.pow(10, -digits)

	if (amount < minDisplayAmount)
		return `<${parseFloat(minDisplayAmount.toFixed(digits)).toString()}`

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

export function insufficientBalanceLines(args: {
	tokenAmount: CurrencyAmountDto
	feeAmount: CurrencyAmountDto
	insufficientAmounts: CurrencyAmountDto[]
	userEvmAddress: string
	feeLabel: string
}): FormattedString[] {
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
			fmt`⚠️ ${FormattedString.b(`Insufficient ${tokenSymbol}`)}`,
			fmt``,
			fmt`Enter a smaller amount`,
		]
	}

	const feeSymbol = feeAmount.currency.symbol

	return [
		fmt`⚠️ ${FormattedString.b(`Insufficient ${feeSymbol} for ${feeLabel}`)}`,
		fmt``,
		fmt`Deposit ${feeSymbol} to:`,
		FormattedString.code(userEvmAddress),
		fmt``,
		fmt`Then press Update`,
	]
}

export function insufficientFundsDepositLines(
	userEvmAddress: string,
): FormattedString[] {
	return [
		fmt`⚠️ ${FormattedString.b('Insufficient funds')}`,
		fmt``,
		fmt`Deposit to:`,
		FormattedString.code(userEvmAddress),
		fmt``,
		fmt`Then press Update`,
	]
}

// TODO: the funds breakdown display block was removed during the
// FormattedString migration. Only the insufficient-balance computation
// remains. Re-introduce a rendered breakdown as FormattedString if needed.
export function fundsBreakdown(
	expenses: Expense[],
	balances: CurrencyAmountDto[],
): FundsBreakdownResult {
	const uniqueBalances = balances.filter(
		(b, i, arr) =>
			arr.findIndex((x) => x.currency.id === b.currency.id) === i,
	)

	const insufficientAmounts: CurrencyAmountDto[] = []

	for (const balance of uniqueBalances) {
		const totalRequired = expenses.reduce((sum, { amount }) => {
			if (amount.currency.id !== balance.currency.id) return sum
			return sum + BigInt(amount.amount)
		}, 0n)

		if (BigInt(balance.amount) < totalRequired) {
			insufficientAmounts.push(balance)
		}
	}

	return { insufficientAmounts }
}
