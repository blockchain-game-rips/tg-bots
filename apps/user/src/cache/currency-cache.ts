import { ChainAddressDtoOutput, CurrencyDtoOutput } from '@rips/api-client'
import { TtlCache } from '@rips/grammy-kit'
import { isSameChainAddress, toCurrencyId } from '@rips/shared'
import { fetchCurrencies } from '../utils/api/wrappers'

/**
 * Long, because a currency's name and decimals do not change. The ttl only
 * bounds how long the bot keeps a currency the backend has since dropped.
 */
const CURRENCY_TTL_MS = 60 * 60 * 1000

/** Lowercased so that a differently cased address is not cached twice. */
function toCurrencyCacheKey(chainAddress: ChainAddressDtoOutput): string {
	return toCurrencyId(chainAddress).toLowerCase()
}

/** The same for every user, so entries are shared rather than kept per user. */
export class CurrencyCache {
	private readonly cache = new TtlCache<
		ChainAddressDtoOutput,
		CurrencyDtoOutput
	>({
		ttlMs: CURRENCY_TTL_MS,
		toKey: toCurrencyCacheKey,
		fetch: (chainAddresses) => this.fetchCurrencies(chainAddresses),
	})

	async get(
		chainAddresses: ChainAddressDtoOutput[],
	): Promise<CurrencyDtoOutput[]> {
		const currencies = await this.cache.get(chainAddresses)

		return currencies.map((currency, index) => {
			if (currency !== undefined) return currency

			const chainAddress = chainAddresses[index]

			const missing =
				chainAddress === undefined
					? `index ${index.toString()}`
					: toCurrencyId(chainAddress)

			throw new Error(`Currency not found for ${missing}`)
		})
	}

	async getOne(
		chainAddress: ChainAddressDtoOutput,
	): Promise<CurrencyDtoOutput> {
		const [currency] = await this.get([chainAddress])

		if (currency === undefined) {
			throw new Error(
				`Currency not found for ${toCurrencyId(chainAddress)}`,
			)
		}

		return currency
	}

	private async fetchCurrencies(
		chainAddresses: ChainAddressDtoOutput[],
	): Promise<Map<string, CurrencyDtoOutput>> {
		const currencies = await fetchCurrencies(
			chainAddresses.map(toCurrencyId),
		)

		const keyed = new Map<string, CurrencyDtoOutput>()

		for (const chainAddress of chainAddresses) {
			const currency = currencies.find((candidate) =>
				isSameChainAddress(candidate.chainAddress, chainAddress),
			)

			if (currency === undefined) continue

			keyed.set(toCurrencyCacheKey(chainAddress), currency)
		}

		return keyed
	}
}

export const currencyCache = new CurrencyCache()
