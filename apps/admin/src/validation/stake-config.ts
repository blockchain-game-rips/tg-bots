import { parsePayload } from '@rips/shared'
import { z } from 'zod'

const prizeDistributionSchema = z.object({
	prizeCount: z
		.number()
		.int('prizeCount must be an integer')
		.min(1, 'prizeCount must be ≥ 1'),
	minPrize: z.number().min(0, 'minPrize must be ≥ 0'),
	maxPrize: z.number().min(0, 'maxPrize must be ≥ 0'),
})

const stakeConfigSchema = z.object({
	stakeId: z
		.number()
		.int('stakeId must be an integer')
		.min(0, 'stakeId must be ≥ 0'),
	ticketCap: z
		.number()
		.int('ticketCap must be an integer')
		.min(1, 'ticketCap must be ≥ 1')
		.refine((n) => (n & (n - 1)) === 0, 'ticketCap must be a power of 2'),
	feePercent: z
		.number()
		.int('feePercent must be an integer')
		.min(0, 'feePercent must be ≥ 0'),
	ticketPrice: z.number().min(0, 'ticketPrice must be ≥ 0'),
	durationSeconds: z
		.number()
		.int('durationSeconds must be an integer')
		.min(1, 'durationSeconds must be ≥ 1'),
	prizeDistribution: z
		.array(prizeDistributionSchema)
		.min(1, 'At least one prize tier is required'),
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

const stakeConfigInputSchema = z.preprocess(parseJson, stakeConfigSchema)

export type ParsedStakeConfig = z.infer<typeof stakeConfigSchema>

export function parseStakeConfig(
	payload: string | undefined,
): ParsedStakeConfig {
	return parsePayload(payload, stakeConfigInputSchema, 'Invalid stake config')
}
