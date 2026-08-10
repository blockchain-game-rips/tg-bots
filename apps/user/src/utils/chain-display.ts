import { EIP155_NAMESPACE, SUPPORTED_CHAINS } from '../constants'
import { Chain } from '../types'

type SupportedChain = (typeof SUPPORTED_CHAINS)[number]
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

const CHAIN_EMOJIS: {
	[N in SupportedNamespace]: Record<ReferencesForNamespace<N>, string>
} = {
	[EIP155_NAMESPACE]: {
		'1': '⚫',
		'56': '🟡',
		'42161': '🔷',
		'10': '🔴',
		'8453': '🔵',
	},
}

function isSupportedNamespace(value: string): value is SupportedNamespace {
	return value in CHAIN_NAMES
}

function isSupportedReference<N extends SupportedNamespace>(
	namespace: N,
	reference: string,
): reference is ReferencesForNamespace<N> {
	return reference in CHAIN_EMOJIS[namespace]
}

function chainNotFoundError(kind: string, chain: Chain): Error {
	return new Error(
		`Chain ${kind} not found for namespace ${chain.namespace} and reference ${chain.reference}`,
	)
}

export function chainToName(chain: Chain): string {
	if (!isSupportedNamespace(chain.namespace)) {
		throw chainNotFoundError('name', chain)
	}

	const chainName = CHAIN_NAMES[chain.namespace][chain.reference]

	if (chainName === undefined) {
		throw chainNotFoundError('name', chain)
	}

	return chainName
}

/**
 * Names a chain without throwing, falling back to the raw CAIP-2 identifier.
 * Receipts for settled transactions must render even when the chain is one the
 * bot does not offer, so an unknown chain degrades the label rather than the
 * whole screen.
 */
export function chainToNameOrReference(chain: Chain): string {
	if (!isSupportedNamespace(chain.namespace)) {
		return toChainId(chain)
	}

	return CHAIN_NAMES[chain.namespace][chain.reference] ?? toChainId(chain)
}

function toChainId(chain: Chain): string {
	return `${chain.namespace}:${chain.reference}`
}

export function chainToEmoji(chain: Chain): string {
	if (!isSupportedNamespace(chain.namespace)) {
		throw chainNotFoundError('emoji', chain)
	}

	if (!isSupportedReference(chain.namespace, chain.reference)) {
		throw chainNotFoundError('emoji', chain)
	}

	return CHAIN_EMOJIS[chain.namespace][chain.reference]
}
