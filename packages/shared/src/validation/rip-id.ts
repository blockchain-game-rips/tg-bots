import { numericIdSchema, parsePayload } from './parse-payload'

export function parseRipId(payload: string | undefined): number {
	return parsePayload(payload, numericIdSchema, 'No rip selected')
}
