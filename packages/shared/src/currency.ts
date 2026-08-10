import {
	ChainAddressDtoOutput,
	CurrencyAmountDtoOutput,
	CurrencyDtoOutput,
} from '@rips/api-client'
import { Chain, isSameChain } from './chain'
import { formatUnits, parseUnits } from './format/units'

export { formatUnits, parseUnits } from './format/units'

const USD_MIN_DISPLAY = 0.01
const MAX_TOFIXED_DIGITS = 6
const FEE_BASIS = 10000

export function toCurrencyId(
	currencyChainAddress: ChainAddressDtoOutput,
): string {
	const { address, chain } = currencyChainAddress
	const { namespace, reference } = chain
	return `${namespace}:${reference}:${address}`
}

export function isSameChainAddress(
	a: ChainAddressDtoOutput,
	b: ChainAddressDtoOutput,
): boolean {
	return (
		isSameChain(a.chain, b.chain) &&
		a.address.toLowerCase() === b.address.toLowerCase()
	)
}

export function currencyToChain(currency: CurrencyDtoOutput): Chain {
	return currency.chainAddress.chain
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
	currency: CurrencyDtoOutput,
): CurrencyAmountDtoOutput {
	return { currency, amount: amount.toString() }
}

export function usdToTokenUnits(
	usd: number,
	currency: CurrencyDtoOutput,
): bigint {
	if (currency.priceUsd <= 0) return 0n

	const tokenAmount = usd / currency.priceUsd

	return parseUnits(tokenAmount.toFixed(currency.decimals), currency.decimals)
}

// Two variants are provided because callers differ in what they have available:
// findCurrencyIndexById takes a derived string key, while findCurrencyIndexByAddress
// takes a ChainAddressDtoOutput directly.
export function findCurrencyIndexById(
	currencies: ChainAddressDtoOutput[],
	currencyId: string,
): number {
	return currencies.findIndex((c) => toCurrencyId(c) === currencyId)
}

export function findCurrencyIndexByAddress(
	currencies: ChainAddressDtoOutput[],
	value: ChainAddressDtoOutput,
): number {
	return currencies.findIndex((c) => isSameChainAddress(c, value))
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

export function currencyAmountDisplayParts(
	currencyAmount: CurrencyAmountDtoOutput,
): {
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

export function formatAmountWithUsd(
	currencyAmount: CurrencyAmountDtoOutput,
): string {
	const { displayAmount, symbol, displayUsdAmount } =
		currencyAmountDisplayParts(currencyAmount)

	return `${displayAmount} ${symbol} ≈ ${displayUsdAmount}`
}

export function formatPercent(basisPoints: number): string {
	return `${((basisPoints / FEE_BASIS) * 100).toFixed(2)}%`
}

// Balances are deduplicated by currency so that paying with the native token
// does not report the same balance twice.
export function findInsufficientBalances(
	expenses: CurrencyAmountDtoOutput[],
	balances: CurrencyAmountDtoOutput[],
): CurrencyAmountDtoOutput[] {
	const uniqueBalances = balances.filter(
		(b, i, arr) =>
			arr.findIndex((x) => x.currency.id === b.currency.id) === i,
	)

	return uniqueBalances.filter((balance) => {
		const totalRequired = expenses.reduce((sum, expense) => {
			if (expense.currency.id !== balance.currency.id) return sum

			return sum + BigInt(expense.amount)
		}, 0n)

		return BigInt(balance.amount) < totalRequired
	})
}
