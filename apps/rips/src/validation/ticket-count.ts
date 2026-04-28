import z from 'zod'
import { parsePayload } from './parse-payload'

const ticketCountSchema = z
	.string()
	.transform(Number)
	.pipe(
		z
			.number({ error: 'Ticket count should be a number' })
			.int('Ticket count should be a whole number')
			.positive('Ticket count should be positive'),
	)

export function parseTicketCount(payload: string | undefined): number {
	return parsePayload(payload, ticketCountSchema, 'Invalid ticket count')
}
