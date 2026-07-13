import {
	ChainAddressDto,
	CurrencyAmountDto,
	CurrencyDto,
} from '@rips/api-client'
import { PayloadCodec } from '@rips/grammy-kit'
import { parseCurrencyChainAddress } from '@rips/shared'
import { SUPPORTED_CURRENCIES } from '../constants'

export function findCurrencyIndex(value: ChainAddressDto): number {
	return SUPPORTED_CURRENCIES.findIndex(
		(c) =>
			c.address === value.address &&
			c.chain.reference === value.chain.reference,
	)
}

export const currencyChainAddressCodec: PayloadCodec<ChainAddressDto> = {
	encode: (currencyChainAddress) =>
		findCurrencyIndex(currencyChainAddress).toString(),
	decode: (raw) => parseCurrencyChainAddress(raw, SUPPORTED_CURRENCIES),
}

export function isSameChainAddress(
	a: ChainAddressDto,
	b: ChainAddressDto,
): boolean {
	return (
		a.chain.namespace === b.chain.namespace &&
		a.chain.reference === b.chain.reference &&
		a.address.toLowerCase() === b.address.toLowerCase()
	)
}

export function toCurrencyId(currencyChainAddress: ChainAddressDto) {
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
