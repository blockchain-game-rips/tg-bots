import { CurrencyAmountDtoOutput, CurrencyDtoOutput } from '@rips/api-client'
import { ErrorToRender } from '@rips/grammy-kit'
import { z } from 'zod'
import { parseUnits } from '../format/units'
import { parsePayload } from './parse-payload'

const amountSchema = z
	.string()
	.regex(/^(-?)([0-9]*)\.?([0-9]*)$/, 'Invalid amount')

export function parseCurrencyAmount(
	payload: string | undefined,
	currency: CurrencyDtoOutput,
): CurrencyAmountDtoOutput {
	const amountString = parsePayload(payload, amountSchema, 'Invalid amount')

	let amount: string
	try {
		amount = parseUnits(amountString, currency.decimals).toString()
	} catch {
		throw new ErrorToRender('Invalid amount')
	}

	return { currency, amount }
}
