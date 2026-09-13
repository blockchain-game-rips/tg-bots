import { FormattedString } from '@grammyjs/parse-mode'
import { AnyHandlerResult, EffectType, toHold } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { describe, expect, it, vi } from 'vitest'
import { buildEligibilityCheck } from '../src/eligibility/eligibility-check'

const TELEGRAM_ID = 111

const CURRENT_TERMS_VERSION = 4

const actionContext = { telegramId: TELEGRAM_ID, flow: null }

const refusal: AnyHandlerResult = {
	flow: toHold(),
	effect: {
		type: EffectType.NAVIGATE,
		page: {
			message: FormattedString.bold('consent'),
			keyboard: new InlineKeyboard(),
		},
	},
}

function acceptedAt(termsVersion: number) {
	return {
		country: 'DE',
		termsVersion,
		acceptedAt: '2026-01-01T00:00:00.000Z',
	}
}

function buildCheck(
	eligibility: ReturnType<typeof acceptedAt> | undefined,
	renderRefusal = () => refusal,
) {
	return buildEligibilityCheck({
		policyCache: {
			get: () =>
				Promise.resolve({
					blockedCountries: [],
					termsVersion: CURRENT_TERMS_VERSION,
					updatedAt: '2026-01-01T00:00:00.000Z',
				}),
		},
		userCache: { get: () => Promise.resolve(eligibility) },
		renderRefusal,
	})
}

describe('buildEligibilityCheck', () => {
	it('proceeds when the user accepted the current terms', async () => {
		const check = buildCheck(acceptedAt(CURRENT_TERMS_VERSION))

		expect(await check(actionContext)).toBeUndefined()
	})

	it('refuses a user who never passed the gate', async () => {
		const check = buildCheck(undefined)

		expect(await check(actionContext)).toEqual(refusal)
	})

	it('refuses a user whose accepted terms are behind the policy', async () => {
		const check = buildCheck(acceptedAt(CURRENT_TERMS_VERSION - 1))

		expect(await check(actionContext)).toEqual(refusal)
	})

	it('renders the refusal only when the user is refused', async () => {
		const renderRefusal = vi.fn(() => refusal)

		await buildCheck(
			acceptedAt(CURRENT_TERMS_VERSION),
			renderRefusal,
		)(actionContext)

		expect(renderRefusal).not.toHaveBeenCalled()

		await buildCheck(undefined, renderRefusal)(actionContext)

		expect(renderRefusal).toHaveBeenCalledOnce()
	})

	it('reads the record for the user who pressed the button', async () => {
		const get = vi.fn(() =>
			Promise.resolve(acceptedAt(CURRENT_TERMS_VERSION)),
		)

		const check = buildEligibilityCheck({
			policyCache: {
				get: () =>
					Promise.resolve({
						blockedCountries: [],
						termsVersion: CURRENT_TERMS_VERSION,
						updatedAt: '2026-01-01T00:00:00.000Z',
					}),
			},
			userCache: { get },
			renderRefusal: () => refusal,
		})

		await check(actionContext)

		expect(get).toHaveBeenCalledWith(TELEGRAM_ID)
	})

	it('propagates a backend failure rather than refusing', async () => {
		const check = buildEligibilityCheck({
			policyCache: {
				get: () => Promise.reject(new Error('backend down')),
			},
			userCache: { get: () => Promise.resolve(undefined) },
			renderRefusal: () => refusal,
		})

		await expect(check(actionContext)).rejects.toThrow('backend down')
	})
})
