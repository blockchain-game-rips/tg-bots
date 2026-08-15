import { ChainAddressDtoOutput } from '@rips/api-client'
import { PayloadCodec } from '@rips/grammy-kit'
import {
	findCurrencyIndexByAddress,
	parseCurrencyChainAddress,
} from '@rips/shared'
import { getSupportedCurrencies } from '../supported-currencies'

export function findCurrencyIndex(value: ChainAddressDtoOutput): number {
	return findCurrencyIndexByAddress(getSupportedCurrencies(), value)
}

export const currencyChainAddressCodec: PayloadCodec<ChainAddressDtoOutput> = {
	encode: (currencyChainAddress) =>
		findCurrencyIndex(currencyChainAddress).toString(),
	decode: (raw) => parseCurrencyChainAddress(raw, getSupportedCurrencies()),
}
