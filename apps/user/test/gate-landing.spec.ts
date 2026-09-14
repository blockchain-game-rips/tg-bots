import { describe, expect, it } from 'vitest'
import { actionIds } from '../src/action-ids'
import { ungatedActions } from '../src/actions'

/**
 * The gate has already ruled by the time it delivers. Re-running the guard on
 * the way in would read the stored record a second time and replace the page
 * the verdict chose — which is how the region refusal became unreachable.
 */
describe('the registry the gate path delivers through', () => {
	it('reaches the region refusal rather than replacing it with the consent page', async () => {
		const blocked = ungatedActions[actionIds.openEligibilityBlocked]

		expect(blocked).toBeDefined()

		const result = await blocked?.handler(
			{ telegramId: 111, flow: null },
			undefined,
		)

		const page =
			result !== undefined &&
			'effect' in result &&
			'page' in result.effect
				? result.effect.page
				: undefined

		expect(page?.message.text).toContain('Region Not Supported')
	})

	it('carries every action the gated registry carries, so the landing cannot go missing', async () => {
		const { actions } = await import('../src/actions')

		expect(Object.keys(ungatedActions).sort()).toEqual(
			Object.keys(actions).sort(),
		)
	})
})
