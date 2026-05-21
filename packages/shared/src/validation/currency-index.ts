import { ChainAddressDto } from '@rips/api-client'
import z from 'zod'
import { parsePayload } from './parse-payload'

function currencyIndexSchema(maxIndex: number) {
	return z
		.string()
		.transform(Number)
		.pipe(
			z
				.number({ error: 'Currency index should be a number' })
				.int('Currency index should be a whole number')
				.min(0, 'Currency index should be non-negative')
				.max(maxIndex, 'Currency index out of range'),
		)
}

export function parseCurrencyChainAddress(
	payload: string | undefined,
	supportedCurrencies: readonly ChainAddressDto[],
): ChainAddressDto {
	const maxIndex = supportedCurrencies.length - 1

	const index = parsePayload(
		payload,
		currencyIndexSchema(maxIndex),
		'Invalid currency index',
	)

	const currency = supportedCurrencies[index]

	if (currency === undefined) throw new Error('Currency index out of range')

	return currency
}
