import { EligibilityPolicyDtoOutput } from '@rips/api-client'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../src/utils/api', () => ({ adminApiKey: 'test-admin-api-key' }))

import { POLICY_SLOT, PolicyPage } from '../src/pages/policy-page'

const TITLE = 'Blocked countries updated'

const policy = (
	overrides: Partial<EligibilityPolicyDtoOutput> = {},
): EligibilityPolicyDtoOutput => ({
	blockedCountries: ['RU', 'KP'],
	termsVersion: 3,
	updatedAt: '2026-09-13T12:00:00.000Z',
	...overrides,
})

const render = (p: EligibilityPolicyDtoOutput): string =>
	PolicyPage.render(TITLE, p).message.text

describe('rendering the policy after a write', () => {
	it('states what happened', () => {
		expect(render(policy())).toContain(TITLE)
	})

	it('lists the blocked countries now in force', () => {
		const text = render(policy())

		expect(text).toContain('RU')
		expect(text).toContain('KP')
	})

	it('says so plainly when nothing is blocked', () => {
		const text = render(policy({ blockedCountries: [] }))

		expect(text.toLowerCase()).toContain('none')
	})

	it('shows the terms version, which the operator never types', () => {
		expect(render(policy())).toContain('3')
	})

	it('holds one back-trail slot, so repeated writes do not stack', () => {
		expect(PolicyPage.render(TITLE, policy()).trailSlot).toBe(POLICY_SLOT)
	})
})
