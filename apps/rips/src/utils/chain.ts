import {
	EIP155_NAMESPACE,
	SUPPORTED_CHAINS as SUPPORTED_CHAINS_LIST,
} from '../constants'
import { Chain } from '../types'

type SupportedChain = (typeof SUPPORTED_CHAINS_LIST)[number]
type SupportedNamespace = SupportedChain['namespace']
type ReferencesForNamespace<N extends SupportedNamespace> = Extract<
	SupportedChain,
	{ namespace: N }
>['reference']

const CHAIN_NAMES: {
	[N in SupportedNamespace]: Record<ReferencesForNamespace<N>, string>
} = {
	[EIP155_NAMESPACE]: {
		'1': 'Ethereum',
		'56': 'BSC',
		'42161': 'Arbitrum',
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

export function chainToName(chain: Chain): string {
	const namespaceMap = CHAIN_NAMES[chain.namespace as SupportedNamespace]
	const chainName =
		namespaceMap?.[
			chain.reference as ReferencesForNamespace<SupportedNamespace>
		]

	if (chainName === undefined) {
		throw new Error(
			`Chain name not found for namespace ${chain.namespace} and reference ${chain.reference}`,
		)
	}

	return chainName
}
