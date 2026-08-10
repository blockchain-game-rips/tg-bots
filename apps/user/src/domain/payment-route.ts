import { ChainAddressDtoOutput } from '@rips/api-client'
import { BASE_CHAIN, NATIVE_ON_BASE } from '../constants'
import { isSameChain, isSameChainAddress } from '@rips/shared'

/**
 * Which of the three ways an entry purchase reaches Base. Decides the quote
 * endpoint, the buy endpoint, and which variant of the success page renders.
 */
export type PaymentRoute = 'direct' | 'samechain' | 'crosschain'

export function resolvePaymentRoute(
	payChainAddress: ChainAddressDtoOutput,
): PaymentRoute {
	if (isSameChainAddress(payChainAddress, NATIVE_ON_BASE)) return 'direct'

	if (isSameChain(payChainAddress.chain, BASE_CHAIN)) return 'samechain'

	return 'crosschain'
}
