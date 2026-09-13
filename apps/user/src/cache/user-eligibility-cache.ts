import { UserEligibilityDtoOutput } from '@rips/api-client'
import { TtlCache } from '@rips/grammy-kit'
import { fetchUserEligibility } from '../utils/api/wrappers'

/**
 * Long, because the record is invalidated explicitly when the gate writes it —
 * the bot owns that write and knows the moment. The ttl only bounds staleness
 * from a record changed outside this process.
 */
export const USER_ELIGIBILITY_CACHE_TTL_MS = 5 * 60 * 1000

function toEligibilityKey(telegramId: number): string {
	return telegramId.toString()
}

export class UserEligibilityCache {
	private readonly cache = new TtlCache<number, UserEligibilityDtoOutput>({
		ttlMs: USER_ELIGIBILITY_CACHE_TTL_MS,
		toKey: toEligibilityKey,
		fetch: (telegramIds) => this.fetchRecords(telegramIds),
	})

	/**
	 * `undefined` where the user was never gated. That absence is deliberately
	 * not cached, so the read right after the gate writes sees the new record
	 * even if the invalidation was missed.
	 */
	async get(
		telegramId: number,
	): Promise<UserEligibilityDtoOutput | undefined> {
		const [eligibility] = await this.cache.get([telegramId])

		return eligibility
	}

	async invalidate(telegramId: number): Promise<void> {
		await this.cache.invalidate([telegramId])
	}

	private async fetchRecords(
		telegramIds: number[],
	): Promise<Map<string, UserEligibilityDtoOutput>> {
		const records = new Map<string, UserEligibilityDtoOutput>()

		for (const telegramId of telegramIds) {
			const eligibility = await fetchUserEligibility(telegramId)

			if (eligibility === undefined) continue

			records.set(toEligibilityKey(telegramId), eligibility)
		}

		return records
	}
}

export const userEligibilityCache = new UserEligibilityCache()
