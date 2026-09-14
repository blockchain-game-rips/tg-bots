import { describe, expect, it } from 'vitest'
import {
	requestCountry,
	TOR_COUNTRY,
	UNKNOWN_COUNTRY,
} from '../src/gate/request-country'

const PRODUCTION = { devCountry: undefined, isDevelopment: false }

const withHeader = (value: string | string[] | undefined) => ({
	headers: { 'cf-ipcountry': value },
})

describe('the country for a request', () => {
	it('reads what Cloudflare observed', () => {
		expect(requestCountry(withHeader('DE'), PRODUCTION)).toBe('DE')
	})

	it('has no fallback when the header is absent', () => {
		expect(requestCountry({ headers: {} }, PRODUCTION)).toBeUndefined()
	})

	it('treats an empty header as absent rather than as a country', () => {
		expect(requestCountry(withHeader(''), PRODUCTION)).toBeUndefined()
	})

	it('passes the no-data code through verbatim rather than normalising it away', () => {
		expect(requestCountry(withHeader(UNKNOWN_COUNTRY), PRODUCTION)).toBe(
			UNKNOWN_COUNTRY,
		)
	})

	it('passes the Tor code through verbatim', () => {
		expect(requestCountry(withHeader(TOR_COUNTRY), PRODUCTION)).toBe(
			TOR_COUNTRY,
		)
	})

	it('takes the first value when the header arrives repeated', () => {
		expect(requestCountry(withHeader(['FR', 'DE']), PRODUCTION)).toBe('FR')
	})
})

describe('the local development override', () => {
	it('stands in for the header when development is in force', () => {
		const country = requestCountry(
			{ headers: {} },
			{ devCountry: 'PL', isDevelopment: true },
		)

		expect(country).toBe('PL')
	})

	it('overrides a header that is present, so the flow can be walked locally', () => {
		const country = requestCountry(withHeader('DE'), {
			devCountry: 'PL',
			isDevelopment: true,
		})

		expect(country).toBe('PL')
	})

	it('cannot take effect in production, so it can never spoof the country', () => {
		const country = requestCountry(withHeader('DE'), {
			devCountry: 'PL',
			isDevelopment: false,
		})

		expect(country).toBe('DE')
	})

	it('leaves a production request with no country when only the override is set', () => {
		const country = requestCountry(
			{ headers: {} },
			{ devCountry: 'PL', isDevelopment: false },
		)

		expect(country).toBeUndefined()
	})
})
