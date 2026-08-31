import { describe, expect, it } from 'vitest'
import { BACK_ACTION_ID } from '../src/action/action-data'
import { declareActions, noPayloadId } from '../src/action/declare-actions'

/** Enough actions that any id the allocator can reach has been issued. */
const ACTIONS_PAST_THE_BACK_ID = 50

describe('declareActions', () => {
	it('gives every declared action an id', () => {
		const actionIds = declareActions({
			openHome: noPayloadId(),
			openWallet: noPayloadId(),
		})

		expect(Object.keys(actionIds)).toEqual(['openHome', 'openWallet'])
	})

	it('gives distinct actions distinct ids', () => {
		const actionIds = declareActions({
			openHome: noPayloadId(),
			openWallet: noPayloadId(),
			openAbout: noPayloadId(),
		})

		const ids = Object.values(actionIds)

		expect(new Set(ids).size).toBe(ids.length)
	})

	it('never issues the reserved back id', () => {
		const names = Array.from(
			{ length: ACTIONS_PAST_THE_BACK_ID },
			(_unused, index) => `action${String(index)}`,
		)

		const actionIds = declareActions(
			Object.fromEntries(names.map((name) => [name, noPayloadId()])),
		)

		expect(Object.values(actionIds)).not.toContain(BACK_ACTION_ID)
	})
})
