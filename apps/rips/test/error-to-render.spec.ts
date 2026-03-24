import { InlineKeyboard } from 'grammy'
import {
	composePageContentWithError,
	ErrorToRender,
} from '../src/utils/error-to-render'

const errorPrefix = '❌ Error:'

const makePageContent = (message: string) => ({
	message,
	keyboard: new InlineKeyboard(),
})

describe('ErrorToRender', () => {
	it('stores formatted messageToRender', () => {
		const err = new ErrorToRender('something went wrong')

		expect(err.messageToRender).toBe(`${errorPrefix} something went wrong`)
	})

	it('stores optional internal message separately', () => {
		const err = new ErrorToRender('user-facing', 'internal details')

		expect(err.message).toBe('internal details')
		expect(err.messageToRender).toBe(`${errorPrefix} user-facing`)
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

			expect(result.message).toBe(
				`Hello world\n\n${errorPrefix} bad input`,
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
				`Hello world\n\n${errorPrefix} old error`,
			)
			const result = composePageContentWithError(
				page,
				new ErrorToRender('new error'),
			)

			expect(result.message).toBe(
				`Hello world\n\n${errorPrefix} new error`,
			)
		})

		it('does not duplicate the error prefix', () => {
			const page = makePageContent(
				`Some text\n\n${errorPrefix} first error`,
			)
			const result = composePageContentWithError(
				page,
				new ErrorToRender('second error'),
			)

			const occurrences = (result.message.match(/❌ Error:/g) ?? [])
				.length

			expect(occurrences).toBe(1)
		})
	})

	describe('when error is not an ErrorToRender', () => {
		it('renders a generic internal server error message', () => {
			const page = makePageContent('Hello')
			const result = composePageContentWithError(
				page,
				new Error('unexpected'),
			)

			expect(result.message).toContain(`${errorPrefix}`)
			expect(result.message).toContain('Internal server error')
		})

		it('handles non-Error thrown values', () => {
			const page = makePageContent('Hello')
			const result = composePageContentWithError(page, 'string error')

			expect(result.message).toContain('Internal server error')
		})
	})
})
