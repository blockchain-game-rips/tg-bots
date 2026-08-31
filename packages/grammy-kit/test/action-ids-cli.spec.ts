import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { runActionIdsCli } from '../src/action/action-ids-cli'

const IN_SYNC = '{"ids":{"openHome":"0"},"next":"1"}'

describe('runActionIdsCli', () => {
	let directory: string
	let lockfilePath: string

	beforeEach(() => {
		directory = mkdtempSync(join(tmpdir(), 'action-ids-cli-'))
		lockfilePath = join(directory, 'action-ids.json')

		vi.spyOn(console, 'log').mockImplementation(() => undefined)
		vi.spyOn(console, 'error').mockImplementation(() => undefined)
	})

	afterEach(() => {
		rmSync(directory, { recursive: true, force: true })
		process.exitCode = undefined
		vi.restoreAllMocks()
	})

	it('writes the lockfile when run without flags', () => {
		runActionIdsCli(lockfilePath, ['openHome'], [])

		expect(readFileSync(lockfilePath, 'utf8')).toContain('openHome')
	})

	it('leaves the exit code clear on a successful write', () => {
		runActionIdsCli(lockfilePath, ['openHome'], [])

		expect(process.exitCode).toBeUndefined()
	})

	it('leaves the exit code clear when the check passes', () => {
		writeFileSync(lockfilePath, IN_SYNC)

		runActionIdsCli(lockfilePath, ['openHome'], ['--check'])

		expect(process.exitCode).toBeUndefined()
	})

	it('reports success when the check passes', () => {
		writeFileSync(lockfilePath, IN_SYNC)

		runActionIdsCli(lockfilePath, ['openHome'], ['--check'])

		expect(vi.mocked(console.log).mock.calls.flat().join(' ')).toMatch(
			/in sync/i,
		)
	})

	it('counts the actions it checked so a skipped run is not mistaken for a pass', () => {
		writeFileSync(lockfilePath, IN_SYNC)

		runActionIdsCli(lockfilePath, ['openHome'], ['--check'])

		expect(vi.mocked(console.log).mock.calls.flat().join(' ')).toContain(
			'1',
		)
	})

	it('reports success when a write leaves the lockfile unchanged', () => {
		writeFileSync(lockfilePath, IN_SYNC)

		runActionIdsCli(lockfilePath, ['openHome'], [])

		expect(vi.mocked(console.log).mock.calls.flat().join(' ')).toMatch(
			/in sync/i,
		)
	})

	it('exits non-zero when the check finds drift', () => {
		writeFileSync(lockfilePath, IN_SYNC)

		runActionIdsCli(lockfilePath, ['openHome', 'added'], ['--check'])

		expect(process.exitCode).toBe(1)
	})

	it('names the drifted action so the failure is actionable', () => {
		writeFileSync(lockfilePath, IN_SYNC)

		runActionIdsCli(lockfilePath, ['openHome', 'added'], ['--check'])

		expect(vi.mocked(console.error).mock.calls.flat().join(' ')).toContain(
			'added',
		)
	})

	it('exits non-zero when the lockfile is malformed', () => {
		writeFileSync(lockfilePath, 'not json')

		runActionIdsCli(lockfilePath, ['openHome'], [])

		expect(process.exitCode).toBe(1)
	})
})
