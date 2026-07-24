import { PayloadCodec } from '@rips/grammy-kit'
import { parseChain } from '@rips/shared'
import {
	SUPPORTED_CHAINS as SUPPORTED_CHAINS_LIST,
	SUPPORTED_CURRENCIES,
} from '../constants'
import { Chain } from '../types'
import { toCurrencyId } from './currency'

export { chainToEmoji, chainToName } from './chain-display'

export function findChainIndex(chain: Chain): number {
	return SUPPORTED_CHAINS_LIST.findIndex(
		(c) =>
			c.namespace === chain.namespace && c.reference === chain.reference,
	)
}

export const chainCodec: PayloadCodec<Chain> = {
	encode: (chain) => findChainIndex(chain).toString(),
	decode: (raw) => parseChain(raw, SUPPORTED_CHAINS_LIST),
}

export function getCurrenciesForChain(chain: Chain): string[] {
	return SUPPORTED_CURRENCIES.filter(
		(c) =>
			c.chain.namespace === chain.namespace &&
			c.chain.reference === chain.reference,
	).map(toCurrencyId)
}

export function truncateAddress(address: string): string {
	return `${address.slice(0, 6)}...${address.slice(-4)}`
}
