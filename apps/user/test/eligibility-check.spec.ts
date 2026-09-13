import { describe, expect, it } from 'vitest'
import { hasAcceptedCurrentTerms } from '../src/eligibility/terms-acceptance'

const CURRENT_TERMS_VERSION = 4

describe('hasAcceptedCurrentTerms', () => {
	it('refuses a user who was never gated', () => {
		expect(hasAcceptedCurrentTerms(undefined, CURRENT_TERMS_VERSION)).toBe(
			false,
		)
	})

	it('refuses a user whose accepted version is behind the current one', () => {
		const eligibility = {
			country: 'DE',
			termsVersion: CURRENT_TERMS_VERSION - 1,
			acceptedAt: '2026-01-01T00:00:00.000Z',
		}

		expect(
			hasAcceptedCurrentTerms(eligibility, CURRENT_TERMS_VERSION),
		).toBe(false)
	})

	it('admits a user who accepted the current version', () => {
		const eligibility = {
			country: 'DE',
			termsVersion: CURRENT_TERMS_VERSION,
			acceptedAt: '2026-01-01T00:00:00.000Z',
		}

		expect(
			hasAcceptedCurrentTerms(eligibility, CURRENT_TERMS_VERSION),
		).toBe(true)
	})

	it('admits a user whose accepted version is ahead, so a policy rollback does not lock them out', () => {
		const eligibility = {
			country: 'DE',
			termsVersion: CURRENT_TERMS_VERSION + 1,
			acceptedAt: '2026-01-01T00:00:00.000Z',
		}

		expect(
			hasAcceptedCurrentTerms(eligibility, CURRENT_TERMS_VERSION),
		).toBe(true)
	})
})
