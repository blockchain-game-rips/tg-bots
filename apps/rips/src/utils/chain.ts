import {
	EIP155_NAMESPACE,
	SUPPORTED_CHAINS as SUPPORTED_CHAINS_LIST,
} from '../constants'
import { Chain } from '../types'

const CHAIN_NAMES: Record<string, Record<string, string> | undefined> = {
	[EIP155_NAMESPACE]: {
		'1': 'Ethereum',
		'56': 'BSC',
		'137': 'Polygon',
		'42161': 'Arbitrum',
		'43114': 'Avalanche',
		'10': 'Optimism',
		'8453': 'Base',
	},
}

export function findChainIndex(chain: Chain): number {
	return SUPPORTED_CHAINS_LIST.findIndex(
		(c) =>
			c.namespace === chain.namespace && c.reference === chain.reference,
	)
}

export function truncateAddress(address: string): string {
	return `${address.slice(0, 6)}...${address.slice(-4)}`
}

//TODO: ensure by type system that chain names has all chains
export function chainToName(chain: Chain): string {
	const chainName = CHAIN_NAMES[chain.namespace]?.[chain.reference]

	if (chainName === undefined) {
		throw new Error(
			`Chain name not found for namespace ${chain.namespace} and reference ${chain.reference}`,
		)
	}

	return chainName
}
