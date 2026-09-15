import { parsePayload } from '@rips/shared'
import { z } from 'zod'

/** The whole fee: what the contract's FEE_BASE denominates basis points in, and
 * the largest value it accepts before reverting FeeTooHigh. */
const MAX_FEE_BP = 10_000

const feeBpSchema = z
	.string()
	.regex(/^\d+$/, 'Must be a whole number')
	.transform(Number)
	.pipe(
		z.number().max(MAX_FEE_BP, `Must be at most ${String(MAX_FEE_BP)} bp`),
	)

export function parseFeeBp(payload: string | undefined): number {
	return parsePayload(payload, feeBpSchema, 'Invalid basis points value')
}
