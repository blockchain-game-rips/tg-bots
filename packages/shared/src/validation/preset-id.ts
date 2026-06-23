import z from 'zod'
import { parsePayload } from './parse-payload'

const presetIdSchema = z
	.string()
	.transform(Number)
	.pipe(z.number().int().positive())

export function parsePresetId(payload: string | undefined): number {
	return parsePayload(payload, presetIdSchema, 'No preset selected')
}
