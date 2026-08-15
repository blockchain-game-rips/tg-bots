import { ChainAddressDtoOutput, CurrencyDtoOutput } from '@rips/api-client'
import { PayloadCodec } from '@rips/grammy-kit'
import {
	Chain,
	currencyToChain,
	findChainIndex as findChainIndexIn,
	isSameChain,
	parseChain,
} from '@rips/shared'
import {
	getSupportedChains,
	getSupportedCurrencies,
} from '../supported-currencies'
import { chainToName } from './chain-display'

export { chainToEmoji, chainToName } from './chain-display'

export function currencyToChainName(currency: CurrencyDtoOutput): string {
	return chainToName(currencyToChain(currency))
}

export function findChainIndex(chain: Chain): number {
	return findChainIndexIn(chain, getSupportedChains())
}

export const chainCodec: PayloadCodec<Chain> = {
	encode: (chain) => findChainIndex(chain).toString(),
	decode: (raw) => parseChain(raw, getSupportedChains()),
}

export function getCurrenciesForChain(chain: Chain): ChainAddressDtoOutput[] {
	return getSupportedCurrencies().filter((c) => isSameChain(c.chain, chain))
}
