import { describe, expect, it } from 'vitest'
import {
	requestCountry,
	TOR_COUNTRY,
	UNKNOWN_COUNTRY,
} from '../src/gate/request-country'

const withHeader = (value: string | string[] | undefined) => ({
	headers: { 'cf-ipcountry': value },
})

describe('the country for a request', () => {
	it('reads what Cloudflare observed', () => {
		expect(requestCountry(withHeader('DE'))).toBe('DE')
	})

	it('has no fallback when the header is absent', () => {
		expect(requestCountry({ headers: {} })).toBeUndefined()
	})

	it('treats an empty header as absent rather than as a country', () => {
		expect(requestCountry(withHeader(''))).toBeUndefined()
	})

	it('passes the no-data code through verbatim rather than normalising it away', () => {
		expect(requestCountry(withHeader(UNKNOWN_COUNTRY))).toBe(
			UNKNOWN_COUNTRY,
		)
	})

	it('passes the Tor code through verbatim', () => {
		expect(requestCountry(withHeader(TOR_COUNTRY))).toBe(TOR_COUNTRY)
	})

	it('takes the first value when the header arrives repeated', () => {
		expect(requestCountry(withHeader(['FR', 'DE']))).toBe('FR')
	})
})
