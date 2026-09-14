import {
	ChainAddressDtoOutput,
	createQuerySerializer,
	currencyControllerGetCurrencies,
	eligibilityControllerGetPolicy,
	eligibilityControllerGetTerms,
	eligibilityControllerGetUserEligibility,
	eligibilityControllerRecordEligibility,
	EligibilityPolicyDtoOutput,
	UserEligibilityDtoOutput,
	currencyControllerGetSupportedCurrencies,
	ripsControllerGetCardCollection,
	ripsControllerGetCardDefinitions,
	ripsControllerGetPayouts,
	ripsControllerGetRips,
	RipsControllerGetRipsResponse,
	walletsControllerGetBalances,
} from '@rips/api-client'
import {
	buildCardCollection,
	CardCollection,
} from '../../domain/card-collection'
import { isApiErrorWithStatus } from './error'
import { userApiKey } from './key'
import { copiesByCardId } from '../../domain/reveal-summary'
import { isSameChainAddress, toCurrencyId } from '@rips/shared'

const chainAddressQuerySerializer = createQuerySerializer({
	allowReserved: true,
})

const NOT_FOUND_STATUS = 404

export async function fetchBalances(
	telegramId: number,
	chainAddresses: ChainAddressDtoOutput[],
) {
	const uniqueChainAddresses = chainAddresses.filter(
		(chainAddress, index) =>
			chainAddresses.findIndex((other) =>
				isSameChainAddress(chainAddress, other),
			) === index,
	)

	const { data } = await walletsControllerGetBalances({
		headers: {
			'x-telegram-id': telegramId.toString(),
			'x-user-key': userApiKey(),
		},
		query: { chainAddress: uniqueChainAddresses.map(toCurrencyId) },
		querySerializer: chainAddressQuerySerializer,
	})

	return data.balances
}

export async function fetchCurrencies(chainAddresses: string[]) {
	const { data } = await currencyControllerGetCurrencies({
		query: { chainAddress: chainAddresses },
		querySerializer: chainAddressQuerySerializer,
	})

	return data.currencies
}

export async function fetchSupportedCurrencies() {
	const { data } = await currencyControllerGetSupportedCurrencies()

	return data.currencies
}

export async function fetchRips(
	ids: number[],
): Promise<RipsControllerGetRipsResponse['rips']> {
	const { data } = await ripsControllerGetRips({
		query: { ids },
		querySerializer: chainAddressQuerySerializer,
	})

	return data.rips
}

export async function fetchRip(
	id: number,
): Promise<RipsControllerGetRipsResponse['rips'][number]> {
	const rips = await fetchRips([id])

	const rip = rips.find((r) => r.id === id)

	if (rip === undefined) {
		throw new Error(`Rip with id ${id.toString()} not found`)
	}

	return rip
}

export async function fetchRipPayouts(telegramId: number, ripId: number) {
	const { data } = await ripsControllerGetPayouts({
		headers: {
			'x-telegram-id': telegramId.toString(),
			'x-user-key': userApiKey(),
		},
		query: { ripId },
	})

	return data.payouts
}

export async function fetchUnrevealedPayouts(telegramId: number) {
	const { data } = await ripsControllerGetPayouts({
		headers: {
			'x-telegram-id': telegramId.toString(),
			'x-user-key': userApiKey(),
		},
	})

	return data.payouts.filter((p) => !p.revealed)
}

export async function fetchCardCollection(
	telegramId: number,
): Promise<CardCollection> {
	return (await fetchCardCollectionWithCounts(telegramId)).collection
}

/**
 * Reveals need per-card copy counts, which CardCollection discards, so the raw
 * response is returned alongside it.
 */
export async function fetchCardCollectionWithCounts(
	telegramId: number,
): Promise<{
	collection: CardCollection
	copiesBefore: Map<number, number>
}> {
	const [{ data: definitions }, { data: collection }] = await Promise.all([
		ripsControllerGetCardDefinitions({
			headers: {
				'x-telegram-id': telegramId.toString(),
				'x-user-key': userApiKey(),
			},
		}),
		ripsControllerGetCardCollection({
			headers: {
				'x-telegram-id': telegramId.toString(),
				'x-user-key': userApiKey(),
			},
		}),
	])

	return {
		collection: buildCardCollection(definitions, collection),
		copiesBefore: copiesByCardId(collection),
	}
}

export async function fetchEligibilityPolicy(): Promise<EligibilityPolicyDtoOutput> {
	const { data } = await eligibilityControllerGetPolicy({
		headers: { 'x-user-key': userApiKey() },
	})

	return data
}

/**
 * The terms PDF as bytes, ready to become an `InputFile`. The route answers
 * `application/pdf`, which the client parses to a `Blob`.
 */
export async function fetchEligibilityTerms(): Promise<Uint8Array> {
	const { data } = await eligibilityControllerGetTerms({
		headers: { 'x-user-key': userApiKey() },
	})

	return new Uint8Array(await data.arrayBuffer())
}

/**
 * The acceptance, recorded the moment the gate reports a fact. The terms
 * version is the bot's own read of the policy rather than anything the caller
 * supplied, which is what keeps it out of the mini app's untrusted input.
 */
export async function recordEligibility(
	telegramId: number,
	country: string,
	termsVersion: number,
): Promise<UserEligibilityDtoOutput> {
	const { data } = await eligibilityControllerRecordEligibility({
		headers: { 'x-user-key': userApiKey() },
		body: {
			telegramId: telegramId.toString(),
			country,
			termsVersion,
		},
	})

	return data
}

/**
 * `undefined` where the user was never gated, which the backend reports as a
 * 404 — an absent record is a normal state for a user who has not yet passed
 * the gate, not a failure.
 */
export async function fetchUserEligibility(
	telegramId: number,
): Promise<UserEligibilityDtoOutput | undefined> {
	try {
		const { data } = await eligibilityControllerGetUserEligibility({
			headers: { 'x-user-key': userApiKey() },
			path: { telegramId: telegramId.toString() },
		})

		return data
	} catch (error) {
		if (isApiErrorWithStatus(error, NOT_FOUND_STATUS)) return undefined

		throw error
	}
}
