import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	ELIGIBILITY_POLICY_CACHE_TTL_MS,
	EligibilityPolicyCache,
} from '../src/cache/eligibility-policy-cache'

const getPolicy = vi.hoisted(() => vi.fn())

vi.mock('../src/utils/api/wrappers', () => ({
	fetchEligibilityPolicy: getPolicy,
}))

const TERMS_VERSION = 3

function policy(termsVersion: number) {
	return {
		blockedCountries: ['RU'],
		termsVersion,
		updatedAt: '2026-01-01T00:00:00.000Z',
	}
}

describe('EligibilityPolicyCache', () => {
	let cache: EligibilityPolicyCache

	beforeEach(() => {
		getPolicy.mockReset()
		getPolicy.mockResolvedValue(policy(TERMS_VERSION))

		cache = new EligibilityPolicyCache()
	})

	it('fetches the policy on a cold read', async () => {
		const current = await cache.get()

		expect(getPolicy).toHaveBeenCalledOnce()
		expect(current).toEqual(policy(TERMS_VERSION))
	})

	it('serves a warm read without fetching', async () => {
		await cache.get()
		await cache.get()

		expect(getPolicy).toHaveBeenCalledOnce()
	})

	it('shares one entry across users', async () => {
		await cache.get()
		await cache.get()
		await cache.get()

		expect(getPolicy).toHaveBeenCalledOnce()
	})

	it('refetches after the ttl expires', async () => {
		vi.useFakeTimers()

		try {
			await cache.get()

			vi.advanceTimersByTime(ELIGIBILITY_POLICY_CACHE_TTL_MS + 1)

			await cache.get()

			expect(getPolicy).toHaveBeenCalledTimes(2)
		} finally {
			vi.useRealTimers()
		}
	})

	it('propagates a backend failure rather than serving a default', async () => {
		getPolicy.mockRejectedValue(new Error('backend down'))

		await expect(cache.get()).rejects.toThrow('backend down')
	})
})
