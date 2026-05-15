import {
	ChainAddressDto,
	CurrencyAmountDto,
	CurrencyDto,
} from '../../generated/api-client'
import { SUPPORTED_CURRENCIES } from '../constants'

export { formatUnits, parseUnits } from './format/units'

export function findCurrencyIndex(value: ChainAddressDto): number {
	return SUPPORTED_CURRENCIES.findIndex(
		(c) =>
			c.address === value.address &&
			c.chain.reference === value.chain.reference,
	)
}

export function toCurrencyId(currencyChainAddress: ChainAddressDto) {
	const { address, chain } = currencyChainAddress

	const { namespace, reference } = chain

	return `${namespace}:${reference}:${address}`
}

export function chainAddressToString(chainAddress: ChainAddressDto): string {
	return `${chainAddress.chain.namespace}:${chainAddress.chain.reference}:${chainAddress.address}`
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
