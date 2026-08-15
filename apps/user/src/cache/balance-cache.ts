import {
	ChainAddressDtoOutput,
	CurrencyAmountDtoOutput,
} from '@rips/api-client'
import { TtlCache } from '@rips/grammy-kit'
import { isSameChainAddress, toCurrencyId } from '@rips/shared'
import { fetchBalances } from '../utils/api/wrappers'

/**
 * Long, because balances are invalidated explicitly wherever the bot moves
 * funds. The ttl only bounds staleness from deposits made outside the bot,
 * which it has no way to learn about.
 */
const BALANCE_TTL_MS = 5 * 60 * 1000

interface BalanceKey {
	telegramId: number
	chainAddress: ChainAddressDtoOutput
}

/** Lowercased so that a differently cased address is not cached twice. */
function toBalanceKey({ telegramId, chainAddress }: BalanceKey): string {
	return `${telegramId.toString()}:${toCurrencyId(chainAddress).toLowerCase()}`
}

export class BalanceCache {
	private readonly cache = new TtlCache<BalanceKey, CurrencyAmountDtoOutput>({
		ttlMs: BALANCE_TTL_MS,
		toKey: toBalanceKey,
		fetch: (keys) => this.fetchBalances(keys),
	})

	/**
	 * Every requested address is expected back, so a gap is an error rather
	 * than a shorter list that would misalign with what the caller asked for.
	 */
	async get(
		telegramId: number,
		chainAddresses: ChainAddressDtoOutput[],
	): Promise<CurrencyAmountDtoOutput[]> {
		const balances = await this.cache.get(
			chainAddresses.map((chainAddress) => ({
				telegramId,
				chainAddress,
			})),
		)

		return balances.map((balance, index) => {
			if (balance !== undefined) return balance

			const chainAddress = chainAddresses[index]

			const missing =
				chainAddress === undefined
					? `index ${index.toString()}`
					: toCurrencyId(chainAddress)

			throw new Error(`Balance not found for ${missing}`)
		})
	}

	/**
	 * The two-address read the money pages need, as a tuple so callers can
	 * destructure it without widening either balance to undefined.
	 */
	async getPair(
		telegramId: number,
		first: ChainAddressDtoOutput,
		second: ChainAddressDtoOutput,
	): Promise<[CurrencyAmountDtoOutput, CurrencyAmountDtoOutput]> {
		const [firstBalance, secondBalance] = await this.get(telegramId, [
			first,
			second,
		])

		if (firstBalance === undefined || secondBalance === undefined) {
			throw new Error('Balance pair not found')
		}

		return [firstBalance, secondBalance]
	}

	async getOne(
		telegramId: number,
		chainAddress: ChainAddressDtoOutput,
	): Promise<CurrencyAmountDtoOutput> {
		const [balance] = await this.get(telegramId, [chainAddress])

		if (balance === undefined) {
			throw new Error(
				`Balance not found for ${toCurrencyId(chainAddress)}`,
			)
		}

		return balance
	}

	async invalidate(
		telegramId: number,
		chainAddresses: ChainAddressDtoOutput[],
	): Promise<void> {
		await this.cache.invalidate(
			chainAddresses.map((chainAddress) => ({
				telegramId,
				chainAddress,
			})),
		)
	}

	private async fetchBalances(
		keys: BalanceKey[],
	): Promise<Map<string, CurrencyAmountDtoOutput>> {
		const [first] = keys

		if (first === undefined) return new Map()

		const chainAddresses = keys.map(({ chainAddress }) => chainAddress)

		const balances = await fetchBalances(first.telegramId, chainAddresses)

		return this.toKeyedBalances(keys, balances)
	}

	private toKeyedBalances(
		keys: BalanceKey[],
		balances: CurrencyAmountDtoOutput[],
	): Map<string, CurrencyAmountDtoOutput> {
		const keyed = new Map<string, CurrencyAmountDtoOutput>()

		for (const key of keys) {
			const balance = balances.find((candidate) =>
				isSameChainAddress(
					candidate.currency.chainAddress,
					key.chainAddress,
				),
			)

			if (balance === undefined) continue

			keyed.set(toBalanceKey(key), balance)
		}

		return keyed
	}
}

export const balanceCache = new BalanceCache()
