import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { parseLockfileText } from '../src/action/action-ids-lockfile'
import { syncActionIds } from '../src/action/sync-action-ids'

describe('syncActionIds', () => {
	let directory: string
	let lockfilePath: string

	function writeLockfile(contents: string): void {
		writeFileSync(lockfilePath, contents)
	}

	function readLockfile() {
		return parseLockfileText(readFileSync(lockfilePath, 'utf8'))
	}

	beforeEach(() => {
		directory = mkdtempSync(join(tmpdir(), 'action-ids-'))
		lockfilePath = join(directory, 'action-ids.json')
	})

	afterEach(() => {
		rmSync(directory, { recursive: true, force: true })
	})

	it('creates a lockfile when none exists', () => {
		syncActionIds({
			lockfilePath,
			declaredNames: ['openHome', 'openExportKey'],
			check: false,
		})

		expect(readLockfile().ids).toEqual({
			openHome: '0',
			openExportKey: '1',
		})
	})

	it('keeps existing ids when a new action is added', () => {
		writeLockfile('{"ids":{"openHome":"0"},"next":"1"}')

		syncActionIds({
			lockfilePath,
			declaredNames: ['added', 'openHome'],
			check: false,
		})

		expect(readLockfile().ids).toEqual({ openHome: '0', added: '1' })
	})

	it('reports no change when the lockfile is already in sync', () => {
		writeLockfile('{"ids":{"openHome":"0"},"next":"1"}')

		const result = syncActionIds({
			lockfilePath,
			declaredNames: ['openHome'],
			check: false,
		})

		expect(result.changed).toBe(false)
	})

	it('leaves the file untouched when nothing changed', () => {
		writeLockfile('{"ids":{"openHome":"0"},"next":"1"}')

		const before = readFileSync(lockfilePath, 'utf8')

		syncActionIds({
			lockfilePath,
			declaredNames: ['openHome'],
			check: false,
		})

		expect(readFileSync(lockfilePath, 'utf8')).toBe(before)
	})

	it('passes the check when the lockfile covers the declarations', () => {
		writeLockfile('{"ids":{"openHome":"0"},"next":"1"}')

		expect(() =>
			syncActionIds({
				lockfilePath,
				declaredNames: ['openHome'],
				check: true,
			}),
		).not.toThrow()
	})

	it('fails the check when an action is missing an id', () => {
		writeLockfile('{"ids":{"openHome":"0"},"next":"1"}')

		expect(() =>
			syncActionIds({
				lockfilePath,
				declaredNames: ['openHome', 'added'],
				check: true,
			}),
		).toThrow(/added/)
	})

	it('does not write during a check', () => {
		writeLockfile('{"ids":{"openHome":"0"},"next":"1"}')

		const before = readFileSync(lockfilePath, 'utf8')

		try {
			syncActionIds({
				lockfilePath,
				declaredNames: ['openHome', 'added'],
				check: true,
			})
		} catch {
			// the failing check is the point; the file must survive it
		}

		expect(readFileSync(lockfilePath, 'utf8')).toBe(before)
	})

	it('refuses to write over a lockfile whose ids collide', () => {
		writeLockfile('{"ids":{"openHome":"0","openExportKey":"0"},"next":"1"}')

		expect(() =>
			syncActionIds({
				lockfilePath,
				declaredNames: ['openHome', 'openExportKey'],
				check: false,
			}),
		).toThrow(/duplicate/i)
	})

	it('fails the check when no lockfile exists yet', () => {
		expect(() =>
			syncActionIds({
				lockfilePath,
				declaredNames: ['openHome'],
				check: true,
			}),
		).toThrow(/openHome/)
	})
})
