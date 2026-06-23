import z from 'zod'
import { parsePayload } from './parse-payload'

const entryCountSchema = z
	.string()
	.transform(Number)
	.pipe(
		z
			.number({ error: 'Entry count should be a number' })
			.int('Entry count should be a whole number')
			.positive('Entry count should be positive'),
	)

export function parseEntryCount(payload: string | undefined): number {
	return parsePayload(payload, entryCountSchema, 'Invalid entry count')
}
