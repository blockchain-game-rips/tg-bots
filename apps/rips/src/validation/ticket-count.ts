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

export function parseTicketCount(raw: string): number {
	return parsePayload(raw, ticketCountSchema, 'Invalid ticket count')
}
