import { EligibilityPolicyDtoOutput } from '@rips/api-client'
import { describe, expect, it, vi } from 'vitest'
import { buildEligibilityFactHandler } from '../src/eligibility/eligibility-fact'

const TELEGRAM_ID = 111

const CURRENT_TERMS_VERSION = 4

const ALLOWED_COUNTRY = 'DE'
const BLOCKED_COUNTRY = 'US'

const HOME_ACTION_ID = '0'
const BLOCKED_ACTION_ID = '1r'

const policy: EligibilityPolicyDtoOutput = {
	blockedCountries: [BLOCKED_COUNTRY],
	termsVersion: CURRENT_TERMS_VERSION,
	updatedAt: '2026-01-01T00:00:00.000Z',
}

function setup() {
	const record = vi.fn(() => Promise.resolve())
	const invalidate = vi.fn(() => Promise.resolve())
	const deliver = vi.fn(() => Promise.resolve())

	const handleFact = buildEligibilityFactHandler({
		policyCache: { get: () => Promise.resolve(policy) },
		record,
		invalidate,
		deliver,
		homeActionId: HOME_ACTION_ID,
		blockedActionId: BLOCKED_ACTION_ID,
	})

	return { record, invalidate, deliver, handleFact }
}

describe('the fact the gate reports', () => {
	it('records the acceptance with the policy version the bot read itself', async () => {
		const { record, handleFact } = setup()

		await handleFact({ telegramId: TELEGRAM_ID, country: ALLOWED_COUNTRY })

		expect(record).toHaveBeenCalledWith(
			TELEGRAM_ID,
			ALLOWED_COUNTRY,
			CURRENT_TERMS_VERSION,
		)
	})

	it('lands the passing user on home', async () => {
		const { deliver, handleFact } = setup()

		await handleFact({ telegramId: TELEGRAM_ID, country: ALLOWED_COUNTRY })

		expect(deliver).toHaveBeenCalledWith({
			telegramId: TELEGRAM_ID,
			action: { actionId: HOME_ACTION_ID, payload: undefined },
		})
	})

	it('invalidates the cache before the page is delivered, so home reads the new record', async () => {
		const { invalidate, deliver, handleFact } = setup()

		await handleFact({ telegramId: TELEGRAM_ID, country: ALLOWED_COUNTRY })

		expect(invalidate).toHaveBeenCalledWith(TELEGRAM_ID)

		expect(invalidate.mock.invocationCallOrder[0]).toBeLessThan(
			deliver.mock.invocationCallOrder[0] ?? 0,
		)
	})

	it('shows the region refusal when the observed country is blocked', async () => {
		const { deliver, handleFact } = setup()

		await handleFact({ telegramId: TELEGRAM_ID, country: BLOCKED_COUNTRY })

		expect(deliver).toHaveBeenCalledWith({
			telegramId: TELEGRAM_ID,
			action: { actionId: BLOCKED_ACTION_ID, payload: undefined },
		})
	})

	it('writes nothing for a blocked country, since there is no acceptance to record', async () => {
		const { record, invalidate, handleFact } = setup()

		await handleFact({ telegramId: TELEGRAM_ID, country: BLOCKED_COUNTRY })

		expect(record).not.toHaveBeenCalled()
		expect(invalidate).not.toHaveBeenCalled()
	})

	it('records before invalidating, so the cache cannot refill from the stale record', async () => {
		const { record, invalidate, handleFact } = setup()

		await handleFact({ telegramId: TELEGRAM_ID, country: ALLOWED_COUNTRY })

		expect(record.mock.invocationCallOrder[0]).toBeLessThan(
			invalidate.mock.invocationCallOrder[0] ?? 0,
		)
	})
})
