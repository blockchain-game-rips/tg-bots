import { parseUnits } from '../utils/currency'
import { ErrorToRender } from '../utils/error-to-render'

export function parseWithdrawAmount(
	payload: string | undefined,
	decimals: number,
	userBalance: bigint,
): string {
	if (payload === undefined) {
		throw new ErrorToRender('Invalid amount')
	}

	let amount: bigint

	try {
		amount = parseUnits(payload, decimals)
	} catch {
		throw new ErrorToRender('Invalid amount')
	}

	if (amount <= 0n) {
		throw new ErrorToRender('Amount must be greater than 0')
	}

	if (amount > userBalance) {
		throw new ErrorToRender('Amount exceeds available to withdraw balance')
	}

	return amount.toString()
}
