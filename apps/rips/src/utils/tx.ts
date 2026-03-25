const GAS = 50000000000000n

export function calcAvailableBalance(balance: bigint) {
	const availableBalance = balance - GAS

	if (availableBalance < 0) return 0n

	return availableBalance
}
