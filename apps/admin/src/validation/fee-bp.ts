import { z } from 'zod'
import { parsePayload } from './parse-payload'

const feeBpSchema = z
	.string()
	.regex(/^\d+$/, 'Must be a whole number')
	.transform(Number)

export function parseFeeBp(payload: string | undefined): number {
	return parsePayload(payload, feeBpSchema, 'Invalid basis points value')
}
