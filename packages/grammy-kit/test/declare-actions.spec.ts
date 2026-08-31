import { describe, expect, it } from 'vitest'
import { BACK_ACTION_ID } from '../src/action/action-data'
import { declareActions, noPayloadId } from '../src/action/declare-actions'

describe('declareActions', () => {
	it('gives every declared action the id the lockfile holds for it', () => {
		const actionIds = declareActions(
			{ ids: { openHome: '7' }, next: '8' },
			{
				openHome: noPayloadId(),
			},
		)

		expect(actionIds.openHome).toBe('7')
	})

	it('keeps an id stable when an action is declared before it', () => {
		const lockfile = { ids: { openHome: '0', inserted: '2' }, next: '3' }

		const actionIds = declareActions(lockfile, {
			inserted: noPayloadId(),
			openHome: noPayloadId(),
		})

		expect(actionIds.openHome).toBe('0')
	})

	it('rejects a declared action the lockfile does not cover', () => {
		expect(() =>
			declareActions(
				{ ids: { openHome: '0' }, next: '1' },
				{
					openHome: noPayloadId(),
					openExportKey: noPayloadId(),
				},
			),
		).toThrow(/openExportKey/)
	})

	it('rejects a lockfile still holding an action that was undeclared', () => {
		expect(() =>
			declareActions(
				{ ids: { openHome: '0', dropped: '1' }, next: '2' },
				{
					openHome: noPayloadId(),
				},
			),
		).toThrow(/dropped/)
	})

	it('never resolves an action to the reserved back id', () => {
		expect(() =>
			declareActions(
				{ ids: { openHome: BACK_ACTION_ID }, next: '1' },
				{
					openHome: noPayloadId(),
				},
			),
		).toThrow()
	})
})
