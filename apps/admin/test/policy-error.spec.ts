import { ApiError } from '@rips/api-client'
import { ErrorToRender } from '@rips/grammy-kit'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../src/utils/api', () => ({ adminApiKey: 'test-admin-api-key' }))

import { toPolicyWriteError } from '../src/utils/policy-error'

const BAD_REQUEST = 400

const INVALID_CODE_ISSUE = {
	message: 'Not a valid ISO 3166-1 alpha-2 country code: QQ',
	path: ['blockedCountries', 1],
}

const validationFailure = (errors: unknown[]): ApiError =>
	new ApiError(BAD_REQUEST, {
		statusCode: BAD_REQUEST,
		message: 'Validation failed',
		errors,
	})

const renderedMessage = (error: unknown): string => {
	const rendered = toPolicyWriteError(error)

	if (!(rendered instanceof ErrorToRender)) {
		throw new Error('expected an error the operator can read')
	}

	return rendered.messageToRender.text
}

describe('surfacing a rejected policy write', () => {
	it('names the offending country code rather than "Validation failed"', () => {
		const message = renderedMessage(validationFailure([INVALID_CODE_ISSUE]))

		expect(message).toContain('QQ')
		expect(message).not.toContain('Validation failed')
	})

	it('names every offending code when several are rejected', () => {
		const message = renderedMessage(
			validationFailure([
				INVALID_CODE_ISSUE,
				{
					message: 'Not a valid ISO 3166-1 alpha-2 country code: ZZ',
					path: ['blockedCountries', 4],
				},
			]),
		)

		expect(message).toContain('QQ')
		expect(message).toContain('ZZ')
	})

	it('says nothing was changed, since the write is all-or-nothing', () => {
		const message = renderedMessage(validationFailure([INVALID_CODE_ISSUE]))

		expect(message.toLowerCase()).toContain('nothing was changed')
	})

	it('falls back to the top-level message when there are no issues', () => {
		const error = new ApiError(BAD_REQUEST, {
			statusCode: BAD_REQUEST,
			message: 'A terms document is required in the "termsFile" field',
		})

		expect(renderedMessage(error)).toContain('terms document is required')
	})

	it('passes a non-api failure through untouched, so it is logged', () => {
		const boom = new Error('socket hang up')

		expect(toPolicyWriteError(boom)).toBe(boom)
	})
})
