import {
	createQuerySerializer,
	currencyControllerGetCurrencies,
	ripsControllerGetPayouts,
	ripsControllerGetPresets,
	RipsControllerGetPresetsResponse,
	ripsControllerGetRips,
	RipsControllerGetRipsResponse,
	walletsControllerGetBalances,
} from '@rips/api-client'
import { NATIVE_ON_BASE } from '../../constants'
import { toCurrencyId } from '../currency'

const chainAddressQuerySerializer = createQuerySerializer({
	allowReserved: true,
})

export async function fetchBalances(
	telegramId: string,
	chainAddresses: string[],
) {
	const { data } = await walletsControllerGetBalances({
		headers: { 'x-telegram-id': telegramId },
		query: { chainAddress: chainAddresses },
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

export async function fetchNativeBalance(telegramId: string) {
	const balances = await fetchBalances(telegramId, [
		toCurrencyId(NATIVE_ON_BASE),
	])

	const balance = (balances as ((typeof balances)[number] | undefined)[])[0]

	if (balance === undefined) {
		throw new Error('No balance found for native asset')
	}

	return balance
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
	chainAddress: string,
) {
	const balances = await fetchBalances(telegramId, [chainAddress])

	const balance = (balances as ((typeof balances)[number] | undefined)[])[0]

	if (balance === undefined) throw new Error('Balance not found')

	return balance
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
