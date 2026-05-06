import { z } from 'zod'
import { parsePayload } from './parse-payload'

const tierSchema = z.object({
	minVolume: z.number().min(0, 'minVolume must be ≥ 0'),
	feePercent: z
		.number()
		.int('feePercent must be an integer')
		.min(0, 'feePercent must be ≥ 0'),
})

function parseJson(val: unknown, ctx: z.RefinementCtx): unknown {
	if (typeof val !== 'string') {
		ctx.addIssue({ code: 'custom', message: 'Expected a string' })
		return z.NEVER
	}

	try {
		return JSON.parse(val)
	} catch {
		ctx.addIssue({ code: 'custom', message: 'Invalid JSON' })
		return z.NEVER
	}
}

const tierListSchema = z.preprocess(
	parseJson,
	z.array(tierSchema).min(1, 'At least one tier is required'),
)

export type ParsedTier = z.infer<typeof tierSchema>

export function parseTierList(payload: string | undefined): ParsedTier[] {
	return parsePayload(payload, tierListSchema, 'Invalid tier list')
}
