import { describe, expect, it } from 'vitest'
import { BACK_ACTION_ID } from '../src/action/action-data'
import {
	allocateActionIds,
	assertLockfileCovers,
	parseLockfile,
	serializeLockfile,
	type ActionIdLockfile,
} from '../src/action/action-ids-lockfile'

function lockfileOf(
	ids: Record<string, string>,
	next: string,
): ActionIdLockfile {
	return { ids, next }
}

describe('allocateActionIds', () => {
	it('assigns ids from scratch when the lockfile is empty', () => {
		const result = allocateActionIds(lockfileOf({}, '0'), ['a', 'b'])

		expect(result.lockfile).toEqual(lockfileOf({ a: '0', b: '1' }, '2'))
	})

	it('keeps the id of an action that is already allocated', () => {
		const result = allocateActionIds(lockfileOf({ a: '0', b: '1' }, '2'), [
			'a',
			'b',
		])

		expect(result.lockfile.ids).toEqual({ a: '0', b: '1' })
	})

	it('leaves ids untouched when an action is inserted at the front', () => {
		const result = allocateActionIds(lockfileOf({ a: '0', b: '1' }, '2'), [
			'inserted',
			'a',
			'b',
		])

		expect(result.lockfile.ids).toEqual({ a: '0', b: '1', inserted: '2' })
	})

	it('leaves ids untouched when actions are reordered', () => {
		const result = allocateActionIds(lockfileOf({ a: '0', b: '1' }, '2'), [
			'b',
			'a',
		])

		expect(result.lockfile.ids).toEqual({ a: '0', b: '1' })
	})

	it('drops the entry of an action that is no longer declared', () => {
		const result = allocateActionIds(lockfileOf({ a: '0', b: '1' }, '2'), [
			'a',
		])

		expect(result.lockfile.ids).toEqual({ a: '0' })
	})

	it('never reuses the id of a removed action', () => {
		const afterRemoval = allocateActionIds(
			lockfileOf({ a: '0', b: '1' }, '2'),
			['a'],
		)
		const afterReadd = allocateActionIds(afterRemoval.lockfile, [
			'a',
			'fresh',
		])

		expect(afterReadd.lockfile.ids['fresh']).toBe('2')
	})

	it('gives a renamed action a fresh id rather than the old one', () => {
		const result = allocateActionIds(lockfileOf({ oldName: '0' }, '1'), [
			'newName',
		])

		expect(result.lockfile.ids).toEqual({ newName: '1' })
	})

	it('advances next by the number of newly allocated actions', () => {
		const result = allocateActionIds(lockfileOf({ a: '0' }, '1'), [
			'a',
			'b',
			'c',
		])

		expect(result.lockfile.next).toBe('3')
	})

	it('encodes ids in base 36 so they stay short', () => {
		const result = allocateActionIds(lockfileOf({}, 'z'), ['a'])

		expect(result.lockfile.ids['a']).toBe('z')
		expect(result.lockfile.next).toBe('10')
	})

	it('reports the lockfile as changed when an action is added', () => {
		const result = allocateActionIds(lockfileOf({ a: '0' }, '1'), [
			'a',
			'b',
		])

		expect(result.changed).toBe(true)
	})

	it('reports the lockfile as changed when an action is removed', () => {
		const result = allocateActionIds(lockfileOf({ a: '0', b: '1' }, '2'), [
			'a',
		])

		expect(result.changed).toBe(true)
	})

	it('reports the lockfile as unchanged when it matches the declarations', () => {
		const result = allocateActionIds(lockfileOf({ a: '0', b: '1' }, '2'), [
			'b',
			'a',
		])

		expect(result.changed).toBe(false)
	})

	it('allocates ids that cannot collide with the reserved back id', () => {
		const result = allocateActionIds(lockfileOf({}, '0'), ['a', 'b', 'c'])

		Object.values(result.lockfile.ids).forEach((id) => {
			expect(id).toMatch(/^[0-9a-z]+$/)
		})
	})

	it('rejects an action name containing the command separator', () => {
		expect(() => allocateActionIds(lockfileOf({}, '0'), ['a:b'])).toThrow(
			/separator/,
		)
	})

	it('rejects a duplicated action name', () => {
		expect(() =>
			allocateActionIds(lockfileOf({}, '0'), ['a', 'a']),
		).toThrow(/duplicate/i)
	})
})

describe('assertLockfileCovers', () => {
	it('passes when every declared action has an id', () => {
		expect(() => {
			assertLockfileCovers(lockfileOf({ a: '0', b: '1' }, '2'), [
				'a',
				'b',
			])
		}).not.toThrow()
	})

	it('passes when the declaration order differs from the lockfile order', () => {
		expect(() => {
			assertLockfileCovers(lockfileOf({ a: '0', b: '1' }, '2'), [
				'b',
				'a',
			])
		}).not.toThrow()
	})

	it('fails when a declared action has no id yet', () => {
		expect(() => {
			assertLockfileCovers(lockfileOf({ a: '0' }, '1'), ['a', 'b'])
		}).toThrow(/b/)
	})

	it('fails when the lockfile holds an action that is no longer declared', () => {
		expect(() => {
			assertLockfileCovers(lockfileOf({ a: '0', b: '1' }, '2'), ['a'])
		}).toThrow(/b/)
	})

	it('fails when two actions share an id', () => {
		expect(() => {
			assertLockfileCovers(lockfileOf({ a: '0', b: '0' }, '1'), [
				'a',
				'b',
			])
		}).toThrow(/duplicate/i)
	})

	it('fails when an id is the reserved back id', () => {
		expect(() => {
			assertLockfileCovers(lockfileOf({ a: BACK_ACTION_ID }, '1'), ['a'])
		}).toThrow(/back/)
	})

	it('fails when an id is at or beyond next', () => {
		expect(() => {
			assertLockfileCovers(lockfileOf({ a: '5' }, '1'), ['a'])
		}).toThrow(/next/)
	})
})

describe('lockfile serialization', () => {
	it('round-trips a lockfile through serialize and parse', () => {
		const lockfile = lockfileOf({ a: '0', b: '1' }, '2')

		expect(parseLockfile(serializeLockfile(lockfile))).toEqual(lockfile)
	})

	it('sorts ids by name so diffs stay readable', () => {
		const serialized = serializeLockfile(
			lockfileOf({ b: '1', a: '0' }, '2'),
		)

		expect(serialized.indexOf('"a"')).toBeLessThan(
			serialized.indexOf('"b"'),
		)
	})

	it('ends with a newline so the file is diff-friendly', () => {
		expect(serializeLockfile(lockfileOf({ a: '0' }, '1'))).toMatch(/\n$/)
	})

	it('parses a missing file as an empty lockfile', () => {
		expect(parseLockfile(undefined)).toEqual(lockfileOf({}, '0'))
	})

	it('rejects a lockfile that is not an object', () => {
		expect(() => parseLockfile('[]')).toThrow()
	})

	it('rejects a lockfile with a non-string id', () => {
		expect(() => parseLockfile('{"ids":{"a":1},"next":"1"}')).toThrow()
	})
})
