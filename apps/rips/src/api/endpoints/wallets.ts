import { apiFetch } from '../client'
import { Balance, balanceSchema, Withdraw, withdrawSchema } from '../schemas'

export function getBalance(telegramId: bigint): Promise<Balance> {
	return apiFetch(`/users/${telegramId}/wallet/balance`, balanceSchema)
}

export function withdraw(
	telegramId: bigint,
	amount: bigint,
	recipientAddress: string,
): Promise<Withdraw> {
	return apiFetch(
		`/users/${telegramId}/wallet/balance/withdraw`,
		withdrawSchema,
		{
			method: 'POST',
			body: JSON.stringify({
				amount: amount.toString(),
				recipientAddress,
			}),
		},
	)
}
