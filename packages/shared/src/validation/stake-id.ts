import z from 'zod'
import { parsePayload } from './parse-payload'

const stakeIdSchema = z
	.string()
	.transform(Number)
	.pipe(z.number().int().positive())

export function parseStakeId(payload: string | undefined): number {
	return parsePayload(payload, stakeIdSchema, 'No stake selected')
}
