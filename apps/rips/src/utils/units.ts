import {
	ChainAddressDto,
	CurrencyAmountDto,
	ripsControllerGetStakes,
	RipsControllerGetStakesResponse,
	walletsControllerGetBalances,
} from '../../generated/api-client'
import { createQuerySerializer } from '../../generated/api-client/client/utils.gen'
import { NATIVE_ON_BASE } from '../constants'

const USD_MIN_DISPLAY = 0.01

function tokenDecimalsFromPrice(priceUsd: number): number {
	const minTokenAmount = USD_MIN_DISPLAY / priceUsd
	return Math.ceil(-Math.log10(minTokenAmount))
}

function formatUsd(usd: number): string {
	if (usd === 0) return '$0'
	if (usd < USD_MIN_DISPLAY) return `<$${USD_MIN_DISPLAY.toFixed(2)}`
	return `$${usd.toFixed(2)}`
}

function formatTokenAmount(
	amount: number,
	priceUsd: number,
): string {
	if (amount === 0) return `0`

	const decimals = tokenDecimalsFromPrice(priceUsd)
	const minDisplayAmount = Math.pow(10, -decimals)

	if (amount < minDisplayAmount)
		return `<${minDisplayAmount.toFixed(decimals)}`

	return `${amount.toFixed(decimals)}`
}

export function formatCurrencyAmount(currencyAmount: CurrencyAmountDto): {
	displayAmount: string
    symbol: string
	displayUsdAmount: string
} {
	const { symbol, priceUsd, decimals } = currencyAmount.currency

	const amount = Number(formatUnits(BigInt(currencyAmount.amount), decimals))
	const usd = amount * priceUsd

	return {
		displayAmount: formatTokenAmount(amount, priceUsd ),
        symbol: symbol,
		displayUsdAmount: formatUsd(usd),
	}
}

export function toUsd(currencyAmount: CurrencyAmountDto): string {
	const formattedAmount = formatUnits(
		BigInt(currencyAmount.amount),
		currencyAmount.currency.decimals,
	)

	const usd = Number(formattedAmount) * currencyAmount.currency.priceUsd

	return `$${usd.toFixed(2)}`
}

export function formattedAmountWithUsd(
	currencyAmount: CurrencyAmountDto,
): string {
	const { displayAmount, symbol, displayUsdAmount } = formatCurrencyAmount(currencyAmount)

	return `${displayAmount} ${symbol} (${displayUsdAmount})`
}

export function formatUnits(amount: bigint, decimals: number): string {
	let display = amount.toString()

	const negative = display.startsWith('-')
	if (negative) display = display.slice(1)

	display = display.padStart(decimals, '0')

	// eslint-disable-next-line prefer-const
	let [integer, fraction] = [
		display.slice(0, display.length - decimals),
		display.slice(display.length - decimals),
	]
	fraction = fraction.replace(/(0+)$/, '')
	return `${negative ? '-' : ''}${integer || '0'}${
		fraction ? `.${fraction}` : ''
	}`
}

export function parseUnits(amount: string | bigint, decimals: number): bigint {
	const value = amount.toString()
	if (!/^(-?)([0-9]*)\.?([0-9]*)$/.test(value))
		throw new Error(`Invalid decimal number: ${value}`)

	let [integer, fraction = '0'] = value.split('.')

	const negative = integer.startsWith('-')
	if (negative) integer = integer.slice(1)

	// trim trailing zeros.
	fraction = fraction.replace(/(0+)$/, '')

	// round off if the fraction is larger than the number of decimals.
	if (decimals === 0) {
		if (Math.round(Number(`.${fraction}`)) === 1)
			integer = `${BigInt(integer) + 1n}`
		fraction = ''
	} else if (fraction.length > decimals) {
		const [left, unit, right] = [
			fraction.slice(0, decimals - 1),
			fraction.slice(decimals - 1, decimals),
			fraction.slice(decimals),
		]

		const rounded = Math.round(Number(`${unit}.${right}`))
		if (rounded > 9)
			fraction = `${BigInt(left) + BigInt(1)}0`.padStart(
				left.length + 1,
				'0',
			)
		else fraction = `${left}${rounded}`

		if (fraction.length > decimals) {
			fraction = fraction.slice(1)
			integer = `${BigInt(integer) + 1n}`
		}

		fraction = fraction.slice(0, decimals)
	} else {
		fraction = fraction.padEnd(decimals, '0')
	}

	return BigInt(`${negative ? '-' : ''}${integer}${fraction}`)
}

export function chainAddressToString(chainAddress: ChainAddressDto): string {
	return `${chainAddress.chain.namespace}:${chainAddress.chain.reference}:${chainAddress.address}`
}

export async function fetchNativeBalance(telegramId: string) {
	const { data } = await walletsControllerGetBalances({
		headers: { 'x-telegram-id': telegramId },
		query: { chainAddress: [chainAddressToString(NATIVE_ON_BASE)] },
		querySerializer: createQuerySerializer({ allowReserved: true }),
	})

	const balance = data.balances[0]

	if (balance === undefined) {
		throw new Error('No balance found for native asset')
	}

	return balance
}

export async function fetchStake(
	stakeId: number,
): Promise<RipsControllerGetStakesResponse['availableStakes'][number]> {
	const { data } = await ripsControllerGetStakes()

	const stake = data.availableStakes.find((s) => s.stake.id === stakeId)

	if (stake === undefined) {
		throw new Error(`Stake with id ${stakeId} not found`)
	}

	return stake
}
