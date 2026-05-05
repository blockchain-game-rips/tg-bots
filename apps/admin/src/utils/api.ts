import {
	ripsControllerGetStakes,
	RipsControllerGetStakesResponse,
	walletsControllerGetBalances,
} from '../../generated/api-client'
import { createQuerySerializer } from '../../generated/api-client/client/utils.gen'
import { NATIVE_ON_BASE } from '../constants'
import { chainAddressToString } from './currency'

export async function fetchNativeBalance(telegramId: string) {
	const { data } = await walletsControllerGetBalances({
		headers: { 'x-telegram-id': telegramId },
		query: { chainAddress: [chainAddressToString(NATIVE_ON_BASE)] },
		querySerializer: createQuerySerializer({ allowReserved: true }),
	})

	const balance = data.balances[0]

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
