import { EIP155_NAMESPACE } from '../constants'
import { Chain } from '../types'

const SUPPORTED_CHAINS: Record<string, Record<string, string> | undefined> = {
	[EIP155_NAMESPACE]: {
		'8453': 'Base',
		'42161': 'Arbitrum',
	},
}

export function truncateAddress(address: string): string {
	return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function chainToName(chain: Chain): string {
	const chainName = SUPPORTED_CHAINS[chain.namespace]?.[chain.reference]

	if (chainName === undefined) {
		throw new Error(
			`Chain name not found for namespace ${chain.namespace} and reference ${chain.reference}`,
		)
	}

	return chainName
}
