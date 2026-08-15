import { Chain } from '@rips/shared'
import { EIP155_NAMESPACE } from '../constants'

/**
 * Presentation-only data for the chains the backend is expected to support. It
 * is deliberately not the source of truth for which chains are offered, so a
 * chain missing here still renders, using its CAIP-2 identifier.
 */
const CHAIN_NAMES: Record<string, Record<string, string | undefined>> = {
	[EIP155_NAMESPACE]: {
		'1': 'Ethereum',
		'56': 'BSC',
		'137': 'Polygon',
		'42161': 'Arbitrum',
		'10': 'Optimism',
		'8453': 'Base',
	},
}

const CHAIN_EMOJIS: Record<string, Record<string, string | undefined>> = {
	[EIP155_NAMESPACE]: {
		'1': '⚫',
		'56': '🟡',
		'137': '🟣',
		'42161': '🔷',
		'10': '🔴',
		'8453': '🔵',
	},
}

const UNKNOWN_CHAIN_EMOJI = '🔗'

function toChainId(chain: Chain): string {
	return `${chain.namespace}:${chain.reference}`
}

function lookupChainName(chain: Chain): string | undefined {
	return CHAIN_NAMES[chain.namespace]?.[chain.reference]
}

function lookupChainEmoji(chain: Chain): string | undefined {
	return CHAIN_EMOJIS[chain.namespace]?.[chain.reference]
}

export function hasFullChainDisplay(chain: Chain): boolean {
	return (
		lookupChainName(chain) !== undefined &&
		lookupChainEmoji(chain) !== undefined
	)
}

export function chainToName(chain: Chain): string {
	return lookupChainName(chain) ?? toChainId(chain)
}

export function chainToEmoji(chain: Chain): string {
	return lookupChainEmoji(chain) ?? UNKNOWN_CHAIN_EMOJI
}
