import { describe, expect, it } from 'vitest'
import { BACK_ACTION_ID } from '../src/action/action-data'
import type { ActionIdLockfile } from '../src/action/action-ids-lockfile'
import { declareActions, noPayloadId } from '../src/action/declare-actions'

function lockfileOf(
	ids: Record<string, string>,
	next: string,
): ActionIdLockfile {
	return { ids, next }
}

describe('declareActions', () => {
	it('gives every declared action the id the lockfile holds for it', () => {
		const actionIds = declareActions(lockfileOf({ openHome: '7' }, '8'), {
			openHome: noPayloadId(),
		})

		expect(actionIds.openHome).toBe('7')
	})

	it('keeps an id stable when an action is declared before it', () => {
		const lockfile = lockfileOf({ openHome: '0', inserted: '2' }, '3')

		const actionIds = declareActions(lockfile, {
			inserted: noPayloadId(),
			openHome: noPayloadId(),
		})

		expect(actionIds.openHome).toBe('0')
	})

	it('rejects a declared action the lockfile does not cover', () => {
		expect(() =>
			declareActions(lockfileOf({ openHome: '0' }, '1'), {
				openHome: noPayloadId(),
				openExportKey: noPayloadId(),
			}),
		).toThrow(/openExportKey/)
	})

	it('rejects a lockfile still holding an action that was undeclared', () => {
		expect(() =>
			declareActions(lockfileOf({ openHome: '0', dropped: '1' }, '2'), {
				openHome: noPayloadId(),
			}),
		).toThrow(/dropped/)
	})

	it('never resolves an action to the reserved back id', () => {
		expect(() =>
			declareActions(lockfileOf({ openHome: BACK_ACTION_ID }, '1'), {
				openHome: noPayloadId(),
			}),
		).toThrow()
	})
})
