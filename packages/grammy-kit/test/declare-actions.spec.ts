import { describe, expect, it } from 'vitest'
import { declareActions, noPayloadId } from '../src/action/declare-actions'

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
		const actionIds = declareActions(
			Object.fromEntries(
				Array.from({ length: 50 }, (_unused, index) => [
					`action${String(index)}`,
					noPayloadId(),
				]),
			),
		)

		expect(Object.values(actionIds)).not.toContain('-')
	})
})
