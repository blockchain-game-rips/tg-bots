import { PayloadCodec } from '@rips/grammy-kit'
import { parseChain } from '@rips/shared'
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

function isSupportedReference<N extends SupportedNamespace>(
	namespace: N,
	reference: string,
): reference is ReferencesForNamespace<N> {
	return reference in CHAIN_EMOJIS[namespace]
}

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

export function chainToEmoji(chain: Chain): string {
	if (!isSupportedNamespace(chain.namespace)) {
		throw new Error(
			`Chain emoji not found for namespace ${chain.namespace} and reference ${chain.reference}`,
		)
	}

	if (!isSupportedReference(chain.namespace, chain.reference)) {
		throw new Error(
			`Chain emoji not found for namespace ${chain.namespace} and reference ${chain.reference}`,
		)
	}

	return CHAIN_EMOJIS[chain.namespace][chain.reference]
}
