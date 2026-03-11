import { wait } from '../utils/common'

export async function getStakesMock() {
	await wait(100)

	return [
		{ stakeId: 1, ticketPrice: 0.0025 },
		{ stakeId: 2, ticketPrice: 0.005 },
		{ stakeId: 3, ticketPrice: 0.01 },
	]
}

export async function getStakeByIdOrThrow(stakeId: string) {
	const stakes = await getStakesMock()
	const stake = stakes.find((s) => s.stakeId.toString() === stakeId)

	if (stake === undefined) {
		throw Error(`stakeId ${stakeId} is invalid`)
	}

	return stake
}
