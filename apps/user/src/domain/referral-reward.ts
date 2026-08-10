import {
	ChainAddressDtoOutput,
	GetReferrerResponseDtoOutput,
} from '@rips/api-client'
import { NATIVE_ON_BASE } from '../constants'
import { isSameChainAddress } from '@rips/shared'

type ReferrerState = GetReferrerResponseDtoOutput['states'][number]

// A missing entry is a broken API contract, not a state a user can reach.
export function findNativeOnBase<
	T extends { currency: { chainAddress: ChainAddressDtoOutput } },
>(candidates: T[], description: string): T {
	const match = candidates.find((candidate) =>
		isSameChainAddress(candidate.currency.chainAddress, NATIVE_ON_BASE),
	)

	if (match === undefined) {
		throw new Error(`No ${description} for native currency on Base`)
	}

	return match
}

export function hasClaimableReward(state: ReferrerState): boolean {
	return BigInt(state.rewards.available) > 0n
}
