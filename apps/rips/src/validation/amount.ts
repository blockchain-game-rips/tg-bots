import { z } from 'zod'
import { CurrencyAmountDto, CurrencyDto } from '../../generated/api-client'
import { ErrorToRender } from '../grammy-kit/effects/error-to-render'
import { parseUnits } from '../utils/units'
import { parsePayload } from './parse-payload'

const amountSchema = z
	.string()
	.regex(/^(-?)([0-9]*)\.?([0-9]*)$/, 'Invalid amount')

export function parseCurrencyAmount(
	raw: string,
	currency: CurrencyDto,
): CurrencyAmountDto {
	const amountString = parsePayload(raw, amountSchema, 'Invalid amount')

	let amount: string
	try {
		amount = parseUnits(amountString, currency.decimals).toString()
	} catch {
		throw new ErrorToRender('Invalid amount')
	}

	return { currency, amount }
}
