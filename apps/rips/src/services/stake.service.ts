import { wait } from '../utils/common'

export async function getStakesMock() {
	await wait(100)

	return [
		{ stakeId: 1, ticketPrice: 0.0025 },
		{ stakeId: 2, ticketPrice: 0.005 },
		{ stakeId: 3, ticketPrice: 0.01 },
	]
}
