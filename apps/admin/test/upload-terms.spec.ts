import { ErrorToRender } from '@rips/grammy-kit'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../src/utils/api', () => ({ adminApiKey: 'test-admin-api-key' }))

import { submitConfirmUploadTerms } from '../src/action-handlers/execute-upload-terms'
import { EffectType } from '../src/types'

const FILE_ID = 'BQACAgIAAxkBAAitermsfile'
const FILE_NAME = 'terms-v4.pdf'

const session = { telegramId: 1, flow: null }

const documentPayload = (fileName: string | null = FILE_NAME): string =>
	JSON.stringify({ tag: 'document', fileId: FILE_ID, fileName })

const submit = (payload: string) =>
	submitConfirmUploadTerms.handler(session, payload)

const confirmationTextOf = (payload: string): string => {
	const result = submit(payload)

	if (
		!('effect' in result) ||
		result.effect.type !== EffectType.NAVIGATE ||
		result.effect.page === undefined
	) {
		throw new Error('expected the submission to navigate to a confirmation')
	}

	return result.effect.page.message.text
}

const messageOf = (payload: string): string => {
	try {
		submit(payload)
	} catch (error) {
		if (error instanceof ErrorToRender) return error.messageToRender.text

		throw error
	}

	throw new Error('expected the submission to be rejected')
}

describe('submitting a terms document', () => {
	it('carries the uploaded file into the confirmation step', () => {
		const result = submit(documentPayload())

		expect(result).toMatchObject({
			flow: { kind: 'set', flow: { data: { fileId: FILE_ID } } },
		})
	})

	it('tells an operator who typed a reply to send a file instead', () => {
		expect(messageOf('here are the new terms').toLowerCase()).toContain(
			'file',
		)
	})

	it('rejects an empty reply', () => {
		expect(messageOf('   ')).toBeTruthy()
	})

	it('names the attached document on the confirmation screen', () => {
		expect(confirmationTextOf(documentPayload())).toContain(FILE_NAME)
	})

	it('names a differently attached document, so a wrong file is visible', () => {
		const wrongFile = 'holiday-photo.pdf'

		expect(confirmationTextOf(documentPayload(wrongFile))).toContain(
			wrongFile,
		)
	})

	it('still confirms when Telegram supplies no file name', () => {
		const text = confirmationTextOf(documentPayload(null))

		expect(text.toLowerCase()).toContain('terms')
	})
})
