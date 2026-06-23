import { parsePayload } from '@rips/shared'
import { z } from 'zod'

const payoutDistributionSchema = z.object({
	payoutCount: z
		.number()
		.int('payoutCount must be an integer')
		.min(1, 'payoutCount must be ≥ 1'),
	minPayout: z.number().min(0, 'minPayout must be ≥ 0'),
	maxPayout: z.number().min(0, 'maxPayout must be ≥ 0'),
})

const presetConfigSchema = z.object({
	presetId: z
		.number()
		.int('presetId must be an integer')
		.min(0, 'presetId must be ≥ 0'),
	entryCap: z
		.number()
		.int('entryCap must be an integer')
		.min(1, 'entryCap must be ≥ 1')
		.refine((n) => (n & (n - 1)) === 0, 'entryCap must be a power of 2'),
	feePercent: z
		.number()
		.int('feePercent must be an integer')
		.min(0, 'feePercent must be ≥ 0'),
	entryPrice: z.number().min(0, 'entryPrice must be ≥ 0'),
	durationSeconds: z
		.number()
		.int('durationSeconds must be an integer')
		.min(1, 'durationSeconds must be ≥ 1'),
	payoutDistribution: z
		.array(payoutDistributionSchema)
		.min(1, 'At least one payout tier is required'),
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

const presetConfigInputSchema = z.preprocess(parseJson, presetConfigSchema)

export type ParsedPresetConfig = z.infer<typeof presetConfigSchema>

export function parsePresetConfig(
	payload: string | undefined,
): ParsedPresetConfig {
	return parsePayload(
		payload,
		presetConfigInputSchema,
		'Invalid preset config',
	)
}
