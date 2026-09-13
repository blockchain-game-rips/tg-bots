import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	USER_ELIGIBILITY_CACHE_TTL_MS,
	UserEligibilityCache,
} from '../src/cache/user-eligibility-cache'

const fetchUserEligibility = vi.hoisted(() => vi.fn())

vi.mock('../src/utils/api/wrappers', () => ({ fetchUserEligibility }))

const ALICE = 111
const BOB = 222

const TERMS_VERSION = 2

function record(termsVersion: number) {
	return {
		country: 'DE',
		termsVersion,
		acceptedAt: '2026-01-01T00:00:00.000Z',
	}
}

describe('UserEligibilityCache', () => {
	let cache: UserEligibilityCache

	beforeEach(() => {
		fetchUserEligibility.mockReset()
		fetchUserEligibility.mockResolvedValue(record(TERMS_VERSION))

		cache = new UserEligibilityCache()
	})

	it('fetches the record on a cold read', async () => {
		const eligibility = await cache.get(ALICE)

		expect(fetchUserEligibility).toHaveBeenCalledWith(ALICE)
		expect(eligibility).toEqual(record(TERMS_VERSION))
	})

	it('serves a warm read without fetching', async () => {
		await cache.get(ALICE)
		await cache.get(ALICE)

		expect(fetchUserEligibility).toHaveBeenCalledOnce()
	})

	it('keeps one entry per user', async () => {
		await cache.get(ALICE)
		await cache.get(BOB)

		expect(fetchUserEligibility).toHaveBeenCalledTimes(2)
		expect(fetchUserEligibility).toHaveBeenCalledWith(BOB)
	})

	it('refetches one user after an explicit invalidation, leaving the other warm', async () => {
		await cache.get(ALICE)
		await cache.get(BOB)

		await cache.invalidate(ALICE)

		await cache.get(ALICE)
		await cache.get(BOB)

		expect(fetchUserEligibility).toHaveBeenCalledTimes(3)
	})

	it('sees a newly written record after invalidation', async () => {
		await cache.get(ALICE)

		fetchUserEligibility.mockResolvedValue(record(TERMS_VERSION + 1))

		await cache.invalidate(ALICE)

		expect(await cache.get(ALICE)).toEqual(record(TERMS_VERSION + 1))
	})

	it('reads a user who was never gated as undefined', async () => {
		fetchUserEligibility.mockResolvedValue(undefined)

		expect(await cache.get(ALICE)).toBeUndefined()
	})

	it('retries a never-gated user rather than caching the absence', async () => {
		fetchUserEligibility.mockResolvedValue(undefined)

		await cache.get(ALICE)

		fetchUserEligibility.mockResolvedValue(record(TERMS_VERSION))

		expect(await cache.get(ALICE)).toEqual(record(TERMS_VERSION))
	})

	it('refetches after the ttl expires', async () => {
		vi.useFakeTimers()

		try {
			await cache.get(ALICE)

			vi.advanceTimersByTime(USER_ELIGIBILITY_CACHE_TTL_MS + 1)

			await cache.get(ALICE)

			expect(fetchUserEligibility).toHaveBeenCalledTimes(2)
		} finally {
			vi.useRealTimers()
		}
	})

	it('propagates a backend failure', async () => {
		fetchUserEligibility.mockRejectedValue(new Error('backend down'))

		await expect(cache.get(ALICE)).rejects.toThrow('backend down')
	})
})
