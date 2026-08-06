import {
	ChainAddressDtoOutput,
	CurrencyAmountDtoOutput,
	CurrencyDtoOutput,
} from '@rips/api-client'
import { PayloadCodec } from '@rips/grammy-kit'
import { parseCurrencyChainAddress, parseUnits } from '@rips/shared'
import { SUPPORTED_CURRENCIES } from '../constants'

export const NATIVE_MAX_MARGIN_USD = 0.1

export function findCurrencyIndex(value: ChainAddressDtoOutput): number {
	return SUPPORTED_CURRENCIES.findIndex(
		(c) =>
			c.address === value.address &&
			c.chain.reference === value.chain.reference,
	)
}

export const currencyChainAddressCodec: PayloadCodec<ChainAddressDtoOutput> = {
	encode: (currencyChainAddress) =>
		findCurrencyIndex(currencyChainAddress).toString(),
	decode: (raw) => parseCurrencyChainAddress(raw, SUPPORTED_CURRENCIES),
}

export function isSameChainAddress(
	a: ChainAddressDtoOutput,
	b: ChainAddressDtoOutput,
): boolean {
	return (
		a.chain.namespace === b.chain.namespace &&
		a.chain.reference === b.chain.reference &&
		a.address.toLowerCase() === b.address.toLowerCase()
	)
}

export function toCurrencyId(currencyChainAddress: ChainAddressDtoOutput) {
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
