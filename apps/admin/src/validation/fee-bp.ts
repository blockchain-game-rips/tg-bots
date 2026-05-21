import { parsePayload } from '@rips/shared'
import { z } from 'zod'

const feeBpSchema = z
	.string()
	.regex(/^\d+$/, 'Must be a whole number')
	.transform(Number)

export function parseFeeBp(payload: string | undefined): number {
	return parsePayload(payload, feeBpSchema, 'Invalid basis points value')
}
