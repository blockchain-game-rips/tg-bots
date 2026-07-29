import { numericIdSchema, parsePayload } from './parse-payload'

export function parsePresetId(payload: string | undefined): number {
	return parsePayload(payload, numericIdSchema, 'No preset selected')
}
