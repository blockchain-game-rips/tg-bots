import {
	currencyControllerGetCurrencies,
	ripsControllerGetStakes,
	RipsControllerGetStakesResponse,
	walletsControllerGetBalances,
} from '../../generated/api-client'
import { createQuerySerializer } from '../../generated/api-client/client/utils.gen'
import { NATIVE_ON_BASE } from '../constants'
import { chainAddressToString } from './currency'

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
		chainAddressToString(NATIVE_ON_BASE),
	])

	const balance = balances[0]

	if (balance === undefined) {
		throw new Error('No balance found for native asset')
	}

	return balance
}

export async function fetchStake(
	stakeId: number,
): Promise<RipsControllerGetStakesResponse['availableStakes'][number]> {
	const { data } = await ripsControllerGetStakes()

	const stake = data.availableStakes.find((s) => s.stake.id === stakeId)

	if (stake === undefined) {
		throw new Error(`Stake with id ${stakeId} not found`)
	}

	return stake
}
