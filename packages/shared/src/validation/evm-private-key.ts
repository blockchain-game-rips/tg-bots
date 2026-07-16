import z from 'zod'
import { parsePayload } from './parse-payload'

const EVM_PRIVATE_KEY_REGEX = /^0x[0-9a-fA-F]{64}$/

const evmPrivateKeySchema = z
	.string()
	.trim()
	.regex(EVM_PRIVATE_KEY_REGEX, 'Invalid private key format')

export function parseEvmPrivateKey(payload: string | undefined): string {
	return parsePayload(
		payload,
		evmPrivateKeySchema,
		'Invalid private key format',
	)
}
