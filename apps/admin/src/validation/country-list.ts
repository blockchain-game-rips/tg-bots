import { ErrorToRender, parseDocumentPayload } from '@rips/grammy-kit'
import { NOTHING_CHANGED } from '../utils/policy-error'

/**
 * The marker an operator sends to block nothing. An empty message cannot mean
 * "clear the list", since it is indistinguishable from a slip of the thumb.
 */
export const EMPTY_COUNTRY_LIST_MARKER = '-'

const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/

const NO_COUNTRIES_BLOCKED = 'None'

/** The one wording for an empty list, so every screen reads the same. */
export function formatBlockedCountries(countries: string[]): string {
	if (countries.length === 0) return NO_COUNTRIES_BLOCKED

	return countries.join(', ')
}

const SEPARATORS = /[\s,;]+/

/**
 * Shape only — that a code is two letters. Whether those letters name a real
 * country is the backend's call, and it names the offending code when it
 * refuses, so the ISO list is not duplicated here.
 */
export function parseCountryList(payload: string | undefined): string[] {
	const raw = payload?.trim() ?? ''

	if (raw === '') {
		throw new ErrorToRender(
			`Send the full list of country codes, or ${EMPTY_COUNTRY_LIST_MARKER} to block none.`,
		)
	}

	if (parseDocumentPayload(raw) !== null) {
		throw new ErrorToRender(
			`Type the country codes as a message — a file cannot be read as a list. ${NOTHING_CHANGED}`,
		)
	}

	if (raw === EMPTY_COUNTRY_LIST_MARKER) return []

	const codes = raw
		.split(SEPARATORS)
		.filter((code) => code !== '')
		.map((code) => code.toUpperCase())

	const malformed = codes.filter((code) => !COUNTRY_CODE_PATTERN.test(code))

	if (malformed.length > 0) {
		throw new ErrorToRender(
			`Not a two-letter country code: ${malformed.join(', ')}. ${NOTHING_CHANGED}`,
		)
	}

	return [...new Set(codes)]
}
