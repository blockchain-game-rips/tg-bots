import z from 'zod'
import { parsePayload } from './parse-payload'

const EVM_ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/

const evmAddressSchema = z
	.string()
	.regex(EVM_ADDRESS_REGEX, 'Invalid address format')

export function parseEvmAddress(raw: string): string {
	return parsePayload(raw, evmAddressSchema, 'Invalid address format')
}
