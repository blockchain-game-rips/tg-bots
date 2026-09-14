import { EligibilityPolicyDtoOutput } from '@rips/api-client'
import { describe, expect, it } from 'vitest'
import { Refusal, verdict } from '../src/eligibility/verdict'

const CURRENT_TERMS_VERSION = 4

const ALLOWED_COUNTRY = 'DE'
const BLOCKED_COUNTRY = 'US'

const policy: EligibilityPolicyDtoOutput = {
	blockedCountries: [BLOCKED_COUNTRY],
	termsVersion: CURRENT_TERMS_VERSION,
	updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('verdict', () => {
	it('admits a user in an allowed country who accepted the current terms', () => {
		expect(
			verdict(ALLOWED_COUNTRY, CURRENT_TERMS_VERSION, policy),
		).toBeUndefined()
	})

	it('refuses a user who was never gated, since no country and no version are known', () => {
		expect(verdict(undefined, undefined, policy)).toBe(Refusal.TERMS)
	})

	it('refuses a user whose accepted version is behind the policy', () => {
		expect(
			verdict(ALLOWED_COUNTRY, CURRENT_TERMS_VERSION - 1, policy),
		).toBe(Refusal.TERMS)
	})

	it('admits a user whose accepted version is ahead, so a rollback does not lock them out', () => {
		expect(
			verdict(ALLOWED_COUNTRY, CURRENT_TERMS_VERSION + 1, policy),
		).toBeUndefined()
	})

	it('refuses a user in a blocked country even with the current terms accepted', () => {
		expect(verdict(BLOCKED_COUNTRY, CURRENT_TERMS_VERSION, policy)).toBe(
			Refusal.COUNTRY,
		)
	})

	it('names the country as the reason when both halves fail, since the country is the harder barrier', () => {
		expect(
			verdict(BLOCKED_COUNTRY, CURRENT_TERMS_VERSION - 1, policy),
		).toBe(Refusal.COUNTRY)
	})

	it('compares the country case-insensitively, since the observed header casing is not guaranteed', () => {
		expect(
			verdict(
				BLOCKED_COUNTRY.toLowerCase(),
				CURRENT_TERMS_VERSION,
				policy,
			),
		).toBe(Refusal.COUNTRY)
	})

	it('refuses on terms when the country is unknown but the version is current', () => {
		expect(verdict(undefined, CURRENT_TERMS_VERSION, policy)).toBe(
			Refusal.TERMS,
		)
	})
})
