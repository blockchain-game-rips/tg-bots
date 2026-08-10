import { ChainDtoOutput } from '@rips/api-client'

export type Chain = ChainDtoOutput

export function isSameChain(a: Chain, b: Chain): boolean {
	return a.namespace === b.namespace && a.reference === b.reference
}

export function findChainIndex(
	chain: Chain,
	supportedChains: readonly Chain[],
): number {
	return supportedChains.findIndex((c) => isSameChain(c, chain))
}
