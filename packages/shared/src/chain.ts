import { Chain } from '@rips/grammy-kit'

export function findChainIndex(
	chain: Chain,
	supportedChains: readonly Chain[],
): number {
	return supportedChains.findIndex(
		(c) =>
			c.namespace === chain.namespace && c.reference === chain.reference,
	)
}

export function truncateAddress(address: string): string {
	const PREFIX_LENGTH = 6
	const SUFFIX_LENGTH = 4

	return `${address.slice(0, PREFIX_LENGTH)}...${address.slice(-SUFFIX_LENGTH)}`
}
