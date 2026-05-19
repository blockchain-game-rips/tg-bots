import {
	createQuerySerializer,
	currencyControllerGetCurrencies,
	ripsControllerGetPrizes,
	ripsControllerGetRounds,
	RipsControllerGetRoundsResponse,
	ripsControllerGetStakes,
	RipsControllerGetStakesResponse,
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

export async function fetchRounds(
	ids: number[],
): Promise<RipsControllerGetRoundsResponse['rounds']> {
	const { data } = await ripsControllerGetRounds({
		query: { ids },
		querySerializer: chainAddressQuerySerializer,
	})

	return data.rounds
}

export async function fetchStakes(): Promise<
	RipsControllerGetStakesResponse['availableStakes']
> {
	const { data } = await ripsControllerGetStakes()

	return data.availableStakes
}

export async function fetchUnrevealedPrizes(telegramId: string) {
	const { data } = await ripsControllerGetPrizes({
		headers: { 'x-telegram-id': telegramId },
	})

	return data.prizes.filter((p) => !p.revealed)
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

export async function fetchStake(
	stakeId: number,
): Promise<RipsControllerGetStakesResponse['availableStakes'][number]> {
	const { data } = await ripsControllerGetStakes()

	const stake = data.availableStakes.find((s) => s.stake.id === stakeId)

	if (stake === undefined) {
		throw new Error(`Stake with id ${stakeId.toString()} not found`)
	}

	return stake
}
