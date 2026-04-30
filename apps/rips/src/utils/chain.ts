import {
	EIP155_NAMESPACE,
	SUPPORTED_CHAINS as SUPPORTED_CHAINS_LIST,
} from '../constants'
import { Chain } from '../types'

const CHAIN_NAMES: Record<string, Record<string, string> | undefined> = {
	[EIP155_NAMESPACE]: {
		'8453': 'Base',
		'42161': 'Arbitrum',
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

export function chainToName(chain: Chain): string {
	const chainName = CHAIN_NAMES[chain.namespace]?.[chain.reference]

	if (chainName === undefined) {
		throw new Error(
			`Chain name not found for namespace ${chain.namespace} and reference ${chain.reference}`,
		)
	}

	return chainName
}
