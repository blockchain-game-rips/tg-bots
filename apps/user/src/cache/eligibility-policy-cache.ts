import { EligibilityPolicyDtoOutput } from '@rips/api-client'
import { TtlCache } from '@rips/grammy-kit'
import { fetchEligibilityPolicy } from '../utils/api/wrappers'

/**
 * Short, because the policy is edited live from the admin bot and the user bot
 * gets no signal about it, so time is the only thing that bounds how long a
 * terms bump goes unnoticed.
 */
export const ELIGIBILITY_POLICY_CACHE_TTL_MS = 30 * 1000

/**
 * The policy is a singleton on the backend and the same for every user, so the
 * whole of it is one entry that everyone shares.
 */
const POLICY_KEY = 'eligibility-policy'

export class EligibilityPolicyCache {
	private readonly cache = new TtlCache<string, EligibilityPolicyDtoOutput>({
		ttlMs: ELIGIBILITY_POLICY_CACHE_TTL_MS,
		toKey: (key) => key,
		fetch: async () => {
			const policy = await fetchEligibilityPolicy()

			return new Map([[POLICY_KEY, policy]])
		},
	})

	async get(): Promise<EligibilityPolicyDtoOutput> {
		const [policy] = await this.cache.get([POLICY_KEY])

		if (policy === undefined)
			throw new Error('Eligibility policy not found')

		return policy
	}
}

export const eligibilityPolicyCache = new EligibilityPolicyCache()
