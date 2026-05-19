import z from 'zod'
import { ChainAddressDto } from '../../generated/api-client'
import { SUPPORTED_CURRENCIES } from '../constants'
import { parsePayload } from './parse-payload'

const currencyIndexSchema = z
	.string()
	.transform(Number)
	.pipe(
		z
			.number({ error: 'Currency index should be a number' })
			.int('Currency index should be a whole number')
			.min(0, 'Currency index should be non-negative')
			.max(
				SUPPORTED_CURRENCIES.length - 1,
				'Currency index out of range',
			),
	)

export function parseCurrencyChainAddress(
	payload: string | undefined,
): ChainAddressDto {
	const index = parsePayload(
		payload,
		currencyIndexSchema,
		'Invalid currency index',
	)
	const currency = SUPPORTED_CURRENCIES[index]

	if (currency === undefined) throw new Error('Currency index out of range')

	return currency
}
