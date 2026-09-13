import { ErrorToRender } from '@rips/grammy-kit'
import { describe, expect, it } from 'vitest'
import { parseCountryList } from '../src/validation/country-list'

const messageOf = (payload: string | undefined): string => {
	try {
		parseCountryList(payload)
	} catch (error) {
		if (error instanceof ErrorToRender) return error.messageToRender.text

		throw error
	}

	throw new Error('expected the country list to be rejected')
}

describe('parsing a whole blocked-country list', () => {
	it('tells an operator who attached a file to type the list instead', () => {
		const attached = JSON.stringify({
			tag: 'document',
			fileId: 'abc',
			fileName: 'terms.pdf',
		})

		expect(messageOf(attached).toLowerCase()).toContain('type')
	})

	it('reads a comma-separated list into codes', () => {
		expect(parseCountryList('US,GB,FR')).toEqual(['US', 'GB', 'FR'])
	})

	it('uppercases and trims what the operator typed', () => {
		expect(parseCountryList(' us , gb ')).toEqual(['US', 'GB'])
	})

	it('accepts newlines and spaces as separators', () => {
		expect(parseCountryList('US\nGB FR')).toEqual(['US', 'GB', 'FR'])
	})

	it('drops repeated codes, keeping the first position', () => {
		expect(parseCountryList('US,GB,us')).toEqual(['US', 'GB'])
	})

	it('reads an explicit empty marker as blocking nothing', () => {
		expect(parseCountryList('-')).toEqual([])
	})

	it('rejects the whole list when one code is malformed', () => {
		expect(messageOf('US,XYZ,GB')).toContain('XYZ')
	})

	it('names every malformed code, not just the first', () => {
		const message = messageOf('US,XYZ,G1')

		expect(message).toContain('XYZ')
		expect(message).toContain('G1')
	})

	it('rejects an empty submission rather than clearing the list', () => {
		expect(messageOf('   ')).toBeTruthy()
	})

	it('rejects a missing payload', () => {
		expect(messageOf(undefined)).toBeTruthy()
	})
})
