import { ChainAddressDtoOutput } from '@rips/api-client'

export const EIP155_NAMESPACE = 'eip155'

export const ETHEREUM_CHAIN = {
	namespace: EIP155_NAMESPACE,
	reference: '1',
} as const

/** Where the game settles, so it is named even though chains come from the backend. */
export const BASE_CHAIN = {
	namespace: EIP155_NAMESPACE,
	reference: '8453',
} as const

const NATIVE_ADDRESS = '0x0000000000000000000000000000000000000000'

/** Stand-in recipient for quotes taken before the user has entered one. */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const NATIVE_ON_BASE: ChainAddressDtoOutput = {
	address: NATIVE_ADDRESS,
	chain: BASE_CHAIN,
}

export function nativeChainAddress(
	chain: ChainAddressDtoOutput['chain'],
): ChainAddressDtoOutput {
	return { address: NATIVE_ADDRESS, chain }
}

export function withNative(
	chainAddress: ChainAddressDtoOutput,
): ChainAddressDtoOutput[] {
	return [chainAddress, nativeChainAddress(chainAddress.chain)]
}

export function isNativeChainAddress(
	chainAddress: ChainAddressDtoOutput,
): boolean {
	return chainAddress.address.toLowerCase() === NATIVE_ADDRESS
}

export const NATIVE_MAX_MARGIN_USD = 0.1
