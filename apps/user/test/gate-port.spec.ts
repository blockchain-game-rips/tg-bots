import { describe, expect, it } from 'vitest'
import { gatePort } from '../src/gate'
import { DEFAULT_GATE_PORT } from '../src/gate/gate-server'

describe('the port the gate listens on', () => {
	it('falls back to the default when nothing is configured', () => {
		expect(gatePort(undefined)).toBe(DEFAULT_GATE_PORT)
	})

	it('takes a configured port', () => {
		expect(gatePort('9000')).toBe(9000)
	})

	/**
	 * `listen(NaN)` binds an arbitrary free port, which would put the public
	 * listener somewhere unpredictable instead of failing where it can be seen.
	 */
	it('refuses a value that is not a number at all', () => {
		expect(() => gatePort('http://gate.example.com')).toThrow('GATE_PORT')
	})

	it('refuses an empty value rather than reading it as zero', () => {
		expect(() => gatePort('')).toThrow('GATE_PORT')
	})

	it('refuses a fractional port', () => {
		expect(() => gatePort('8787.5')).toThrow('GATE_PORT')
	})

	it('refuses a port below the valid range', () => {
		expect(() => gatePort('0')).toThrow('GATE_PORT')
	})

	it('refuses a port above the valid range', () => {
		expect(() => gatePort('65536')).toThrow('GATE_PORT')
	})

	it('names the offending value so a typo is obvious', () => {
		expect(() => gatePort('not-a-port')).toThrow('not-a-port')
	})
})
