import { z } from 'zod'
import { apiFetch } from '../client'
import { TicketPrize, ticketPrizeSchema, User, userSchema } from '../schemas'

export function getUser(telegramId: bigint): Promise<User> {
	return apiFetch(`/users/${telegramId}`, userSchema)
}

export function createUser(telegramId: bigint): Promise<User> {
	return apiFetch('/users', userSchema, {
		method: 'POST',
		body: JSON.stringify({ telegramId: telegramId.toString() }),
	})
}

export function getUnrevealedPrizes(
	telegramId: bigint,
): Promise<TicketPrize[]> {
	return apiFetch(
		`/users/${telegramId}/unrevealed-prizes`,
		z.array(ticketPrizeSchema),
	)
}

export function revealTicketPrizes(
	telegramId: bigint,
	revealAll: boolean,
): Promise<TicketPrize[]> {
	return apiFetch(`/users/${telegramId}/reveal`, z.array(ticketPrizeSchema), {
		method: 'POST',
		body: JSON.stringify({ revealAll }),
	})
}
