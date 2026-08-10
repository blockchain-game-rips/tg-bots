import { Chain } from '@rips/shared'
import { EIP155_NAMESPACE } from '../constants'

const CHAIN_NAMES: Record<string, Record<string, string> | undefined> = {
	[EIP155_NAMESPACE]: {
		'8453': 'Base',
		'42161': 'Arbitrum',
	},
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
