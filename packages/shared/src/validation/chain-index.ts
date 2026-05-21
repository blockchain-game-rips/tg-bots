import { Chain } from '@rips/grammy-kit'
import z from 'zod'
import { parsePayload } from './parse-payload'

function chainIndexSchema(maxIndex: number) {
	return z
		.string()
		.transform(Number)
		.pipe(
			z
				.number({ error: 'Chain index should be a number' })
				.int('Chain index should be a whole number')
				.min(0, 'Chain index should be non-negative')
				.max(maxIndex, 'Chain index out of range'),
		)
}

export function parseChain(
	payload: string | undefined,
	supportedChains: readonly Chain[],
): Chain {
	const maxIndex = supportedChains.length - 1

	const index = parsePayload(
		payload,
		chainIndexSchema(maxIndex),
		'Invalid chain index',
	)

	const chain = supportedChains[index]

	if (chain === undefined) throw new Error('Chain index out of range')

	return chain
}
