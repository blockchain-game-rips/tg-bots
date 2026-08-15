import {
	ChainAddressDtoOutput,
	createQuerySerializer,
	currencyControllerGetCurrencies,
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
import { copiesByCardId } from '../../domain/reveal-summary'
import { isSameChainAddress, toCurrencyId } from '@rips/shared'

const chainAddressQuerySerializer = createQuerySerializer({
	allowReserved: true,
})

export async function fetchBalances(
	telegramId: string,
	chainAddresses: ChainAddressDtoOutput[],
) {
	const uniqueChainAddresses = chainAddresses.filter(
		(chainAddress, index) =>
			chainAddresses.findIndex((other) =>
				isSameChainAddress(chainAddress, other),
			) === index,
	)

	const { data } = await walletsControllerGetBalances({
		headers: { 'x-telegram-id': telegramId },
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

export async function fetchRipPayouts(telegramId: string, ripId: number) {
	const { data } = await ripsControllerGetPayouts({
		headers: { 'x-telegram-id': telegramId },
		query: { ripId },
	})

	return data.payouts
}

export async function fetchUnrevealedPayouts(telegramId: string) {
	const { data } = await ripsControllerGetPayouts({
		headers: { 'x-telegram-id': telegramId },
	})

	return data.payouts.filter((p) => !p.revealed)
}

export async function fetchCardCollection(
	telegramId: string,
): Promise<CardCollection> {
	return (await fetchCardCollectionWithCounts(telegramId)).collection
}

/**
 * Reveals need per-card copy counts, which CardCollection discards, so the raw
 * response is returned alongside it.
 */
export async function fetchCardCollectionWithCounts(
	telegramId: string,
): Promise<{
	collection: CardCollection
	copiesBefore: Map<number, number>
}> {
	const headers = { 'x-telegram-id': telegramId }

	const [{ data: definitions }, { data: collection }] = await Promise.all([
		ripsControllerGetCardDefinitions({ headers }),
		ripsControllerGetCardCollection({ headers }),
	])

	return {
		collection: buildCardCollection(definitions, collection),
		copiesBefore: copiesByCardId(collection),
	}
}
