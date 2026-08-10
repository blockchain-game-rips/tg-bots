import { CurrencyDtoOutput } from '@rips/api-client'
import { PayloadCodec } from '@rips/grammy-kit'
import {
	Chain,
	currencyToChain,
	findChainIndex as findChainIndexIn,
	isSameChain,
	parseChain,
	toCurrencyId,
} from '@rips/shared'
import {
	SUPPORTED_CHAINS as SUPPORTED_CHAINS_LIST,
	SUPPORTED_CURRENCIES,
} from '../constants'
import { chainToName } from './chain-display'

export {
	chainToEmoji,
	chainToName,
	chainToNameOrReference,
} from './chain-display'

export function currencyToChainName(currency: CurrencyDtoOutput): string {
	return chainToName(currencyToChain(currency))
}

export function findChainIndex(chain: Chain): number {
	return findChainIndexIn(chain, SUPPORTED_CHAINS_LIST)
}

export const chainCodec: PayloadCodec<Chain> = {
	encode: (chain) => findChainIndex(chain).toString(),
	decode: (raw) => parseChain(raw, SUPPORTED_CHAINS_LIST),
}

export function getCurrenciesForChain(chain: Chain): string[] {
	return SUPPORTED_CURRENCIES.filter((c) => isSameChain(c.chain, chain)).map(
		toCurrencyId,
	)
}
