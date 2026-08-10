import { ChainAddressDtoOutput } from '@rips/api-client'
import { PayloadCodec } from '@rips/grammy-kit'
import {
	findCurrencyIndexByAddress,
	parseCurrencyChainAddress,
} from '@rips/shared'
import { SUPPORTED_CURRENCIES } from '../constants'

export function findCurrencyIndex(value: ChainAddressDtoOutput): number {
	return findCurrencyIndexByAddress(SUPPORTED_CURRENCIES, value)
}

export const currencyChainAddressCodec: PayloadCodec<ChainAddressDtoOutput> = {
	encode: (currencyChainAddress) =>
		findCurrencyIndex(currencyChainAddress).toString(),
	decode: (raw) => parseCurrencyChainAddress(raw, SUPPORTED_CURRENCIES),
}
