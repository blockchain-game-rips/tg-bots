import { describe, expect, it } from 'vitest'
import { buildActions } from '../src/action/actions'
import { noPayload, withPayload } from '../src/action/action-def'
import {
	declareActions,
	noPayloadId,
	withPayloadId,
} from '../src/action/declare-actions'

const numberCodec = {
	encode: (value: number) => value.toString(),
	decode: (raw: string) => Number(raw),
}

describe('buildActions', () => {
	const actionIds = declareActions(
		{ ids: { openHome: '0', openRip: '1' }, next: '2' },
		{
			openHome: noPayloadId(),
			openRip: withPayloadId<number>(),
		},
	)

	const registry = {
		openHome: noPayload(() => ({}) as never),
		openRip: withPayload(numberCodec, () => ({}) as never),
	}

	it('binds each handler under the id its declaration allocated', () => {
		const actions = buildActions(actionIds, registry)

		expect(Object.keys(actions).sort()).toEqual(
			[actionIds.openHome, actionIds.openRip].sort(),
		)
	})

	it('decodes a payload with the codec the handler declared', () => {
		const actions = buildActions(actionIds, registry)

		expect(actions[actionIds.openRip]?.decode('42')).toBe(42)
	})

	it('binds handlers by name, not by the order the registry lists them', () => {
		const reordered = {
			openRip: registry.openRip,
			openHome: registry.openHome,
		}

		const actions = buildActions(actionIds, reordered)

		expect(actions[actionIds.openRip]?.decode('7')).toBe(7)
	})
})
