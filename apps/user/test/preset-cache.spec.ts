import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PRESET_CACHE_TTL_MS, PresetCache } from '../src/cache/preset-cache'

const getPresets = vi.hoisted(() => vi.fn())

vi.mock('@rips/api-client', () => ({ ripsControllerGetPresets: getPresets }))

const PRESET_TTL_MS = PRESET_CACHE_TTL_MS

function presetWithId(id: number) {
	return { preset: { id }, configs: [] }
}

describe('PresetCache', () => {
	let cache: InstanceType<typeof PresetCache>

	beforeEach(() => {
		getPresets.mockReset()
		getPresets.mockResolvedValue({
			data: { availablePresets: [presetWithId(1), presetWithId(2)] },
		})

		cache = new PresetCache()
	})

	it('fetches the list on a cold read', async () => {
		const presets = await cache.getAll()

		expect(getPresets).toHaveBeenCalledOnce()
		expect(presets).toEqual([presetWithId(1), presetWithId(2)])
	})

	it('serves a warm read without fetching', async () => {
		await cache.getAll()
		await cache.getAll()

		expect(getPresets).toHaveBeenCalledOnce()
	})

	it('serves a single preset from the same entry as the list', async () => {
		await cache.getAll()

		const preset = await cache.getOne(2)

		expect(getPresets).toHaveBeenCalledOnce()
		expect(preset).toEqual(presetWithId(2))
	})

	it('shares one entry across users', async () => {
		await cache.getOne(1)
		await cache.getAll()

		expect(getPresets).toHaveBeenCalledOnce()
	})

	it('throws when the preset is not in the list', async () => {
		await expect(cache.getOne(99)).rejects.toThrow('99')
	})

	it('refetches after the ttl expires', async () => {
		vi.useFakeTimers()

		try {
			await cache.getAll()

			vi.advanceTimersByTime(PRESET_TTL_MS + 1)

			await cache.getAll()

			expect(getPresets).toHaveBeenCalledTimes(2)
		} finally {
			vi.useRealTimers()
		}
	})
})
