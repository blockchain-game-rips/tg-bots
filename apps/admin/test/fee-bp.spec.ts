import { ErrorToRender } from '@rips/grammy-kit'
import { describe, expect, it } from 'vitest'
import { parseFeeBp } from '../src/validation/fee-bp'

const MAX_FEE_BP = 10_000

const messageOf = (payload: string | undefined): string => {
	try {
		parseFeeBp(payload)
	} catch (error) {
		if (error instanceof ErrorToRender) return error.messageToRender.text

		throw error
	}

	throw new Error('expected the fee to be rejected')
}

describe('parsing a fee in basis points', () => {
	it('reads a whole number of basis points', () => {
		expect(parseFeeBp('500')).toBe(500)
	})

	it('accepts zero, which clears a custom fee', () => {
		expect(parseFeeBp('0')).toBe(0)
	})

	it('accepts the whole fee, which is the largest the contract takes', () => {
		expect(parseFeeBp(String(MAX_FEE_BP))).toBe(MAX_FEE_BP)
	})

	it('rejects a fee above 100%, rather than letting the chain revert', () => {
		expect(messageOf(String(MAX_FEE_BP + 1))).toBeTruthy()
	})

	it('names the limit so the operator knows what to type instead', () => {
		expect(messageOf('50000')).toContain(String(MAX_FEE_BP))
	})

	it('rejects a fee that would overflow the contract uint16', () => {
		expect(messageOf('70000')).toBeTruthy()
	})

	it('rejects a fractional fee', () => {
		expect(messageOf('5.5')).toBeTruthy()
	})

	it('rejects a negative fee', () => {
		expect(messageOf('-500')).toBeTruthy()
	})

	it('rejects something that is not a number at all', () => {
		expect(messageOf('half a percent')).toBeTruthy()
	})

	it('rejects an empty submission', () => {
		expect(messageOf('   ')).toBeTruthy()
	})

	it('rejects a missing payload', () => {
		expect(messageOf(undefined)).toBeTruthy()
	})
})
