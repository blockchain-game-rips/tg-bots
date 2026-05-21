import {
	createQuerySerializer,
	ripsControllerGetStakes,
	RipsControllerGetStakesResponse,
	walletsControllerGetBalances,
} from '@rips/api-client'
import { getEnvSafe, toCurrencyId } from '@rips/shared'
import { NATIVE_ON_BASE } from '../constants'

export async function fetchNativeBalance(telegramId: string) {
	const { data } = await walletsControllerGetBalances({
		headers: { 'x-telegram-id': telegramId },
		query: { chainAddress: [toCurrencyId(NATIVE_ON_BASE)] },
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

const adminApiKey = getEnvSafe('ADMIN_API_KEY')

export const adminApiHeader = {
	'x-admin-api-key': adminApiKey,
}
