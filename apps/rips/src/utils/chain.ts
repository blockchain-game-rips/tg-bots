import {
	EIP155_NAMESPACE,
	SUPPORTED_CHAINS as SUPPORTED_CHAINS_LIST,
	SUPPORTED_CURRENCIES,
} from '../constants'
import { Chain } from '../types'
import { toCurrencyId } from './currency'

type SupportedChain = (typeof SUPPORTED_CHAINS_LIST)[number]
type SupportedNamespace = SupportedChain['namespace']
type ReferencesForNamespace<N extends SupportedNamespace> = Extract<
	SupportedChain,
	{ namespace: N }
>['reference']

const CHAIN_NAMES: {
	[N in SupportedNamespace]: Record<ReferencesForNamespace<N>, string> &
		Record<string, string | undefined>
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

function isSupportedNamespace(value: string): value is SupportedNamespace {
	return value in CHAIN_NAMES
}

export function chainToName(chain: Chain): string {
	if (!isSupportedNamespace(chain.namespace)) {
		throw new Error(
			`Chain name not found for namespace ${chain.namespace} and reference ${chain.reference}`,
		)
	}

	const chainName = CHAIN_NAMES[chain.namespace][chain.reference]

	if (chainName === undefined) {
		throw new Error(
			`Chain name not found for namespace ${chain.namespace} and reference ${chain.reference}`,
		)
	}

	return chainName
}
