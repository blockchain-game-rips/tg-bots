import {
	ripsControllerGetPresets,
	RipsControllerGetPresetsResponse,
} from '@rips/api-client'
import { TtlCache } from '@rips/grammy-kit'

/**
 * Presets change on the backend, which the bot gets no signal about, so time is
 * the only thing that can bound their staleness.
 */
export const PRESET_CACHE_TTL_MS = 5 * 60 * 1000

type AvailablePreset =
	RipsControllerGetPresetsResponse['availablePresets'][number]

/**
 * The endpoint returns every preset at once, so the whole list is one entry.
 * Presets are the same for every user, so that entry is shared by all of them.
 */
const PRESET_LIST_KEY = 'presets'

export class PresetCache {
	private readonly cache = new TtlCache<string, AvailablePreset[]>({
		ttlMs: PRESET_CACHE_TTL_MS,
		toKey: (key) => key,
		fetch: async () => {
			const { data } = await ripsControllerGetPresets()

			return new Map([[PRESET_LIST_KEY, data.availablePresets]])
		},
	})

	async getAll(): Promise<AvailablePreset[]> {
		const [presets] = await this.cache.get([PRESET_LIST_KEY])

		if (presets === undefined) throw new Error('Presets not found')

		return presets
	}

	async getOne(presetId: number): Promise<AvailablePreset> {
		const presets = await this.getAll()

		const preset = presets.find(({ preset }) => preset.id === presetId)

		if (preset === undefined) {
			throw new Error(`Preset with id ${presetId.toString()} not found`)
		}

		return preset
	}
}

export const presetCache = new PresetCache()
