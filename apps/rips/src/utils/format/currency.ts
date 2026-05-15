import { CurrencyAmountDto } from '../../../generated/api-client'
import { formatUnits } from './units'

const USD_MIN_DISPLAY = 0.01
const MAX_TOFIXED_DIGITS = 6

function toFixedDigitsFromPrice(priceUsd: number): number {
	if (priceUsd <= 0) return MAX_TOFIXED_DIGITS

	const minTokenAmount = USD_MIN_DISPLAY / priceUsd
	const digits = Math.ceil(-Math.log10(minTokenAmount))

	return Math.min(Math.max(digits, 0), MAX_TOFIXED_DIGITS)
}

function formatUsd(usd: number): string {
	if (usd === 0) return '$0'
	if (usd < USD_MIN_DISPLAY) return `&lt;$${USD_MIN_DISPLAY.toFixed(2)}`
	return `$${usd.toFixed(2)}`
}

function formatTokenAmount(amount: number, priceUsd: number): string {
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
