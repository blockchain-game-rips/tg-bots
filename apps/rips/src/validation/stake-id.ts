import z from 'zod'
import { parsePayload } from './parse-payload'

const stakeIdSchema = z
	.string()
	.transform(Number)
	.pipe(z.number().int().positive())

export function parseStakeId(raw: string): number {
	return parsePayload(raw, stakeIdSchema, 'No stake selected')
}
