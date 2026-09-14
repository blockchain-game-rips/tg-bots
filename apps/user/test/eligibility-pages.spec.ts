import { FormattedString } from '@rips/grammy-kit'
import { InputFile } from 'grammy'
import { describe, expect, it } from 'vitest'
import { BlockedPage } from '../src/pages/eligibility/blocked-page'
import { ConsentPage } from '../src/pages/eligibility/consent-page'

const GATE_URL = 'https://gate.example.com/eligibility'

const TERMS_DOCUMENT = new InputFile(new Uint8Array(), 'terms.pdf')

const WELCOME_HEADER = '👋 Welcome to Rips'
const BARRIER_EMOJI = '⛔'

// The copy settled with the user in 08-screens-and-copy.md, which is the source
// of truth rather than anything re-derived from the implementation.
const CONSENT_TEXT = `📋 Before You Play

Before you start, please confirm:

• You are 18 or older
• You accept the Terms of Service

Tap Agree to continue. We'll check that Rips is available in your region.`

const BLOCKED_TEXT = `📍 Region Not Supported

Rips isn't available in your region, so you can't play from here.

Nothing has happened to your account, and any balance stays yours. Run /start to check again.`

function boldRanges({ text, entities }: FormattedString): string[] {
	return entities
		.filter((entity) => entity.type === 'bold')
		.map(({ offset, length }) => text.slice(offset, offset + length))
}

describe('the consent screen', () => {
	const page = ConsentPage.render({
		gateUrl: GATE_URL,
		termsDocument: TERMS_DOCUMENT,
	})

	it('states both bullets and the closing line about the region check', () => {
		expect(page.message.text).toBe(CONSENT_TEXT)
	})

	it('bolds the header and the two terms the user is confirming', () => {
		expect(boldRanges(page.message)).toEqual([
			'Before You Play',
			'18 or older',
			'Terms of Service',
		])
	})

	it('offers Agree & Continue as the only button, since the terms ride along', () => {
		expect(page.keyboard.inline_keyboard).toEqual([
			[{ text: 'Agree & Continue', web_app: { url: GATE_URL } }],
		])
	})

	it('carries the terms document on the message itself', () => {
		expect(page.media).toEqual({
			kind: 'document',
			file: TERMS_DOCUMENT,
		})
	})

	it('avoids the header WelcomePage owns and never accuses the user', () => {
		expect(page.message.text).not.toContain(WELCOME_HEADER)
		expect(page.message.text).not.toContain(BARRIER_EMOJI)
	})
})

describe('the region refusal', () => {
	const page = BlockedPage.render()

	it('says the balance stays yours and offers /start to check again', () => {
		expect(page.message.text).toBe(BLOCKED_TEXT)
	})

	it('bolds only the header', () => {
		expect(boldRanges(page.message)).toEqual(['Region Not Supported'])
	})

	it('offers no button, so nobody hammers Try Again in place', () => {
		expect(page.keyboard.inline_keyboard).toEqual([])
	})

	it('names a place rather than a fault', () => {
		expect(page.message.text).not.toContain(BARRIER_EMOJI)
		expect(page.message.text).not.toContain(WELCOME_HEADER)
	})
})
