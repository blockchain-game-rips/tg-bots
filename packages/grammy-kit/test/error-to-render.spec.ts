import {
	composePageContentWithError,
	ErrorToRender,
	fmt,
	generateErrorId,
} from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'

const errorPrefix = '❌ Error:'

const marker = '\u200B'

const genericMessage =
	'❌ Something went wrong. Please try again or send /start for a fresh menu.'

const makePageContent = (message: string) => ({
	message: fmt`${message}`,
	keyboard: new InlineKeyboard(),
})

describe('ErrorToRender', () => {
	it('stores formatted messageToRender', () => {
		const err = new ErrorToRender('something went wrong')

		expect(err.messageToRender.text).toBe(
			`${errorPrefix} something went wrong`,
		)
	})

	it('stores optional internal message separately', () => {
		const err = new ErrorToRender('user-facing', 'internal details')

		expect(err.message).toBe('internal details')
		expect(err.messageToRender.text).toBe(`${errorPrefix} user-facing`)
	})

	it('is an instance of Error', () => {
		expect(new ErrorToRender('oops')).toBeInstanceOf(Error)
	})
})

describe('composePageContentWithError', () => {
	describe('when page message has no prior error', () => {
		it('appends the error message with two empty lines', () => {
			const page = makePageContent('Hello world')
			const result = composePageContentWithError(
				page,
				new ErrorToRender('bad input'),
			)

			expect(result.message.text).toBe(
				`Hello world\n\n${marker}${errorPrefix} bad input`,
			)
		})

		it('preserves the keyboard', () => {
			const page = makePageContent('Hello world')
			const result = composePageContentWithError(
				page,
				new ErrorToRender('bad input'),
			)

			expect(result.keyboard).toBe(page.keyboard)
		})
	})

	describe('when page message already contains an error', () => {
		it('replaces the existing error with the new one', () => {
			const page = makePageContent(
				`Hello world\n\n${marker}${errorPrefix} old error`,
			)
			const result = composePageContentWithError(
				page,
				new ErrorToRender('new error'),
			)

			expect(result.message.text).toBe(
				`Hello world\n\n${marker}${errorPrefix} new error`,
			)
		})

		it('does not duplicate the error prefix', () => {
			const page = makePageContent(
				`Some text\n\n${marker}${errorPrefix} first error`,
			)
			const result = composePageContentWithError(
				page,
				new ErrorToRender('second error'),
			)

			const occurrences = (result.message.text.match(/❌ Error:/g) ?? [])
				.length

			expect(occurrences).toBe(1)
		})
	})

	describe('when error is not an ErrorToRender', () => {
		it('renders the generic error message', () => {
			const page = makePageContent('Hello')
			const result = composePageContentWithError(
				page,
				new Error('unexpected'),
			)

			expect(result.message.text).toContain(genericMessage)
		})

		it('handles non-Error thrown values', () => {
			const page = makePageContent('Hello')
			const result = composePageContentWithError(page, 'string error')

			expect(result.message.text).toContain(genericMessage)
		})

		it('renders the error id when one is given', () => {
			const page = makePageContent('Hello')
			const result = composePageContentWithError(
				page,
				new Error('unexpected'),
				'K7QM4X',
			)

			expect(result.message.text).toContain('Error ID: K7QM4X')
		})

		it('omits the error id line when none is given', () => {
			const page = makePageContent('Hello')
			const result = composePageContentWithError(
				page,
				new Error('unexpected'),
			)

			expect(result.message.text).not.toContain('Error ID:')
		})

		it('replaces a previous generic error rather than stacking it', () => {
			const page = makePageContent('Hello')
			const first = composePageContentWithError(
				page,
				new Error('unexpected'),
				'AAAAAA',
			)
			const second = composePageContentWithError(
				first,
				new Error('unexpected'),
				'BBBBBB',
			)

			expect(second.message.text).toContain('Error ID: BBBBBB')
			expect(second.message.text).not.toContain('AAAAAA')
		})

		it('replaces a previous ErrorToRender with a generic error', () => {
			const page = makePageContent('Hello')
			const first = composePageContentWithError(
				page,
				new ErrorToRender('bad input'),
			)
			const second = composePageContentWithError(
				first,
				new Error('unexpected'),
				'K7QM4X',
			)

			expect(second.message.text).toBe(
				`Hello\n\n${marker}${genericMessage}\nError ID: K7QM4X`,
			)
		})
	})

	describe('when the page copy contains an unrelated ❌', () => {
		it('does not strip it', () => {
			const page = makePageContent('❌ Zap failed')
			const result = composePageContentWithError(
				page,
				new ErrorToRender('bad input'),
			)

			expect(result.message.text).toBe(
				`❌ Zap failed\n\n${marker}${errorPrefix} bad input`,
			)
		})
	})
})

describe('generateErrorId', () => {
	it('is six characters long', () => {
		expect(generateErrorId()).toHaveLength(6)
	})

	it('excludes lookalike characters', () => {
		const ids = Array.from({ length: 200 }, () => generateErrorId()).join(
			'',
		)

		expect(ids).toMatch(/^[ABCDEFGHJKMNPQRSTVWXYZ23456789]+$/)
	})
})
