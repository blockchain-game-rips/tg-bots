import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TtlCache } from '../src/cache/ttl-cache'

const TTL_MS = 60_000

interface Fetched {
	key: string
	value: number
}

describe('TtlCache', () => {
	let fetchCalls: string[][]
	let cache: TtlCache<string, Fetched>

	function createCache(
		fetchImpl: (keys: string[]) => Promise<Map<string, Fetched>>,
	) {
		fetchCalls = []

		return new TtlCache<string, Fetched>({
			ttlMs: TTL_MS,
			toKey: (key) => key,
			fetch: async (keys) => {
				fetchCalls.push(keys)

				return fetchImpl(keys)
			},
		})
	}

	function valuesFor(keys: string[]): Map<string, Fetched> {
		return new Map(keys.map((key) => [key, { key, value: key.length }]))
	}

	beforeEach(() => {
		cache = createCache((keys) => Promise.resolve(valuesFor(keys)))
	})

	it('fetches every key on a cold read', async () => {
		const result = await cache.get(['a', 'bb'])

		expect(fetchCalls).toEqual([['a', 'bb']])
		expect(result).toEqual([
			{ key: 'a', value: 1 },
			{ key: 'bb', value: 2 },
		])
	})

	it('serves a warm read without fetching', async () => {
		await cache.get(['a', 'bb'])
		const result = await cache.get(['a', 'bb'])

		expect(fetchCalls).toHaveLength(1)
		expect(result).toEqual([
			{ key: 'a', value: 1 },
			{ key: 'bb', value: 2 },
		])
	})

	it('fetches only the missing keys of a partly warm read', async () => {
		await cache.get(['a', 'bb'])
		await cache.get(['a', 'bb', 'ccc'])

		expect(fetchCalls).toEqual([['a', 'bb'], ['ccc']])
	})

	it('returns values in the order the caller asked for', async () => {
		await cache.get(['bb'])

		const result = await cache.get(['a', 'bb', 'ccc'])

		expect(result.map((entry) => entry?.key)).toEqual(['a', 'bb', 'ccc'])
	})

	it('refetches only the invalidated key', async () => {
		await cache.get(['a', 'bb'])
		await cache.invalidate(['a'])
		await cache.get(['a', 'bb'])

		expect(fetchCalls).toEqual([['a', 'bb'], ['a']])
	})

	it('refetches after the ttl expires', async () => {
		vi.useFakeTimers()

		try {
			await cache.get(['a'])

			vi.advanceTimersByTime(TTL_MS + 1)

			await cache.get(['a'])

			expect(fetchCalls).toEqual([['a'], ['a']])
		} finally {
			vi.useRealTimers()
		}
	})

	it('does not refetch before the ttl expires', async () => {
		vi.useFakeTimers()

		try {
			await cache.get(['a'])

			vi.advanceTimersByTime(TTL_MS - 1)

			await cache.get(['a'])

			expect(fetchCalls).toHaveLength(1)
		} finally {
			vi.useRealTimers()
		}
	})

	it('makes no request when every key is warm', async () => {
		await cache.get(['a'])

		fetchCalls.length = 0

		await cache.get(['a'])

		expect(fetchCalls).toEqual([])
	})

	it('leaves a hole rather than shifting later values up', async () => {
		const partial = createCache((keys) =>
			Promise.resolve(valuesFor(keys.filter((key) => key !== 'a'))),
		)

		const result = await partial.get(['a', 'bb'])

		expect(result).toEqual([undefined, { key: 'bb', value: 2 }])
	})

	it('reports keys the fetch did not return as undefined', async () => {
		const partial = createCache((keys) =>
			Promise.resolve(valuesFor(keys.filter((key) => key !== 'bb'))),
		)

		const result = await partial.get(['a', 'bb'])

		expect(result).toEqual([{ key: 'a', value: 1 }, undefined])
	})

	it('retries a key the fetch did not return', async () => {
		const partial = createCache((keys) =>
			Promise.resolve(valuesFor(keys.filter((key) => key !== 'bb'))),
		)

		await partial.get(['a', 'bb'])
		await partial.get(['a', 'bb'])

		expect(fetchCalls).toEqual([['a', 'bb'], ['bb']])
	})

	it('deduplicates repeated keys in one read', async () => {
		await cache.get(['a', 'a'])

		expect(fetchCalls).toEqual([['a']])
	})
})
