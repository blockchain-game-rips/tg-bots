import Keyv from 'keyv'

export interface TtlCacheOptions<K, V> {
	ttlMs: number

	/** Turns a domain key into the string key the store is keyed by. */
	toKey: (key: K) => string

	/**
	 * Fetches the keys that were missing. Only ever called with the misses, so
	 * a warm read costs no request and a partly warm read fetches the gap.
	 */
	fetch: (keys: K[]) => Promise<Map<string, V>>
}

/**
 * A read-through cache over batched fetches. Reads are expressed as a batch so
 * that a miss costs one request for the missing keys rather than one per key.
 *
 * Keyv backs the store, so moving off memory later is a store swap rather than
 * a rewrite.
 */
export class TtlCache<K, V> {
	private readonly store: Keyv<V>
	private readonly ttlMs: number
	private readonly toKey: (key: K) => string
	private readonly fetch: (keys: K[]) => Promise<Map<string, V>>

	constructor({ ttlMs, toKey, fetch }: TtlCacheOptions<K, V>) {
		this.store = new Keyv<V>({ ttl: ttlMs })
		this.ttlMs = ttlMs
		this.toKey = toKey
		this.fetch = fetch
	}

	/**
	 * Returns one slot per requested key, in the order asked for. A key the
	 * fetch does not return reads as undefined rather than shifting the values
	 * after it up, and stays uncached so a later read retries it.
	 */
	async get(keys: K[]): Promise<(V | undefined)[]> {
		const unique = this.deduplicate(keys)

		const cached = await this.readCached(unique)

		const missing = unique.filter(({ stringKey }) => !cached.has(stringKey))

		const fetched = await this.fetchMissing(missing)

		const byKey = new Map([...cached, ...fetched])

		return keys.map((key) => byKey.get(this.toKey(key)))
	}

	async invalidate(keys: K[]): Promise<void> {
		if (keys.length === 0) return

		await this.store.deleteMany(keys.map((key) => this.toKey(key)))
	}

	private deduplicate(keys: K[]): { key: K; stringKey: string }[] {
		const seen = new Set<string>()

		return keys.flatMap((key) => {
			const stringKey = this.toKey(key)

			if (seen.has(stringKey)) return []

			seen.add(stringKey)

			return [{ key, stringKey }]
		})
	}

	private async readCached(
		keys: { key: K; stringKey: string }[],
	): Promise<Map<string, V>> {
		if (keys.length === 0) return new Map()

		const values = await this.store.getMany<V>(
			keys.map(({ stringKey }) => stringKey),
		)

		const cached = new Map<string, V>()

		values.forEach((value, index) => {
			const entry = keys[index]

			if (value === undefined || value === null || entry === undefined) {
				return
			}

			cached.set(entry.stringKey, value)
		})

		return cached
	}

	private async fetchMissing(
		missing: { key: K; stringKey: string }[],
	): Promise<Map<string, V>> {
		if (missing.length === 0) return new Map()

		const fetched = await this.fetch(missing.map(({ key }) => key))

		const entries = [...fetched].map(([stringKey, value]) => ({
			key: stringKey,
			value,
			ttl: this.ttlMs,
		}))

		if (entries.length > 0) await this.store.setMany(entries)

		return fetched
	}
}
