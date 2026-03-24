import { z } from 'zod'
import { apiFetch } from '../client'
import {
	BuyTickets,
	buyTicketsSchema,
	Round,
	roundSchema,
	Stake,
	stakeSchema,
} from '../schemas'

export function getStakes(): Promise<Stake[]> {
	return apiFetch('/rips/stakes', z.array(stakeSchema))
}

export function getRounds(): Promise<Round[]> {
	return apiFetch('/rips/rounds', z.array(roundSchema))
}

export function buyTickets(
	telegramId: bigint,
	stakeId: number,
	amount: number,
): Promise<BuyTickets> {
	return apiFetch(`/rips/users/${telegramId}/buy-tickets`, buyTicketsSchema, {
		method: 'POST',
		body: JSON.stringify({ stakeId, amount }),
	})
}
