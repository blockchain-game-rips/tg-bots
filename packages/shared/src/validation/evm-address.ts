import z from 'zod'
import { parsePayload } from './parse-payload'

const EVM_ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/

const evmAddressSchema = z
	.string()
	.regex(EVM_ADDRESS_REGEX, 'Invalid address format')

export function parseEvmAddress(payload: string | undefined): string {
	return parsePayload(payload, evmAddressSchema, 'Invalid address format')
}

/** For payloads that arrive from outside the bot, where a malformed value is
 * ignored rather than reported. */
export function parseEvmAddressOrUndefined(
	payload: string | undefined,
): string | undefined {
	const result = evmAddressSchema.safeParse(payload)

	return result.success ? result.data : undefined
}

export function sameEvmAddress(a: string, b: string): boolean {
	return a.toLowerCase() === b.toLowerCase()
}
