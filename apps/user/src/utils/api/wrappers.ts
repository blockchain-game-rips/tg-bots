import {
	ChainAddressDtoOutput,
	createQuerySerializer,
	CurrencyAmountDtoOutput,
	currencyControllerGetCurrencies,
	ripsControllerGetCardCollection,
	ripsControllerGetCardDefinitions,
	ripsControllerGetPayouts,
	ripsControllerGetPresets,
	RipsControllerGetPresetsResponse,
	ripsControllerGetRips,
	RipsControllerGetRipsResponse,
	walletsControllerGetBalances,
} from '@rips/api-client'
import { NATIVE_ON_BASE } from '../../constants'
import {
	buildCardCollection,
	CardCollection,
} from '../../domain/card-collection'
import { isSameChainAddress, toCurrencyId } from '../currency'

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

export function getBalance(
	balances: CurrencyAmountDtoOutput[],
	chainAddress: ChainAddressDtoOutput,
): CurrencyAmountDtoOutput {
	const balance = balances.find((b) =>
		isSameChainAddress(b.currency.chainAddress, chainAddress),
	)

	if (balance === undefined) {
		throw new Error(`Balance not found for ${toCurrencyId(chainAddress)}`)
	}

	return balance
}

export async function fetchCurrencies(chainAddresses: string[]) {
	const { data } = await currencyControllerGetCurrencies({
		query: { chainAddress: chainAddresses },
		querySerializer: chainAddressQuerySerializer,
	})

	return data.currencies
}

export async function fetchCurrency(chainAddress: ChainAddressDtoOutput) {
	const currencies = await fetchCurrencies([toCurrencyId(chainAddress)])

	const currency = currencies.find((c) =>
		isSameChainAddress(c.chainAddress, chainAddress),
	)

	if (currency === undefined) {
		throw new Error(`Currency not found for ${toCurrencyId(chainAddress)}`)
	}

	return currency
}

export async function fetchNativeBalance(telegramId: string) {
	const balances = await fetchBalances(telegramId, [NATIVE_ON_BASE])

	return getBalance(balances, NATIVE_ON_BASE)
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

export async function fetchPresets(): Promise<
	RipsControllerGetPresetsResponse['availablePresets']
> {
	const { data } = await ripsControllerGetPresets()

	return data.availablePresets
}

export async function fetchUnrevealedPayouts(telegramId: string) {
	const { data } = await ripsControllerGetPayouts({
		headers: { 'x-telegram-id': telegramId },
	})

	return data.payouts.filter((p) => !p.revealed)
}

export async function fetchSingleBalance(
	telegramId: string,
	chainAddress: ChainAddressDtoOutput,
) {
	const balances = await fetchBalances(telegramId, [chainAddress])

	return getBalance(balances, chainAddress)
}

export async function fetchCardCollection(
	telegramId: string,
): Promise<CardCollection> {
	const headers = { 'x-telegram-id': telegramId }

	const [{ data: definitions }, { data: collection }] = await Promise.all([
		ripsControllerGetCardDefinitions({ headers }),
		ripsControllerGetCardCollection({ headers }),
	])

	return buildCardCollection(definitions, collection)
}

export async function fetchPreset(
	presetId: number,
): Promise<RipsControllerGetPresetsResponse['availablePresets'][number]> {
	const { data } = await ripsControllerGetPresets()

	const preset = data.availablePresets.find((s) => s.preset.id === presetId)

	if (preset === undefined) {
		throw new Error(`Preset with id ${presetId.toString()} not found`)
	}

	return preset
}
