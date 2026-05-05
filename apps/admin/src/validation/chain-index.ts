import z from 'zod'
import { SUPPORTED_CHAINS } from '../constants'
import { Chain } from '../types'
import { parsePayload } from './parse-payload'

const chainIndexSchema = z
	.string()
	.transform(Number)
	.pipe(
		z
			.number({ error: 'Chain index should be a number' })
			.int('Chain index should be a whole number')
			.min(0, 'Chain index should be non-negative')
			.max(SUPPORTED_CHAINS.length - 1, 'Chain index out of range'),
	)

export function parseChain(payload: string | undefined): Chain {
	const index = parsePayload(payload, chainIndexSchema, 'Invalid chain index')

	return SUPPORTED_CHAINS[index]
}
