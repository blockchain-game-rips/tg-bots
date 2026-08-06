import { fmt, FormattedString } from '@grammyjs/parse-mode'
import { PageContent } from '../types'

const errorPrefixToRender = '❌ Error:'

const ERROR_BLOCK_MARKER = '\u200B'

const GENERIC_ERROR_MESSAGE =
	'❌ Something went wrong. Please try again or send /start for a fresh menu.'

const ERROR_ID_ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789'

const ERROR_ID_LENGTH = 6

export class ErrorToRender extends Error {
	messageToRender: FormattedString

	constructor(rawMessageToRender: string, message?: string) {
		super(message)

		this.messageToRender = errorMessageToRender(rawMessageToRender)
	}
}

export function generateErrorId(): string {
	let errorId = ''

	for (let index = 0; index < ERROR_ID_LENGTH; index++) {
		const position = Math.floor(Math.random() * ERROR_ID_ALPHABET.length)

		errorId += ERROR_ID_ALPHABET.charAt(position)
	}

	return errorId
}

export function composePageContentWithError(
	currentPageContent: PageContent,
	error: unknown,
	errorId?: string,
): PageContent {
	const errorMessage = getErrorMessageToRender(error, errorId)

	const baseMessage = stripExistingError(currentPageContent.message)

	const message = fmt`${baseMessage}\n\n${ERROR_BLOCK_MARKER}${errorMessage}`

	return { ...currentPageContent, message }
}

function stripExistingError(message: FormattedString): FormattedString {
	const markerIndex = message.text.indexOf(ERROR_BLOCK_MARKER)

	if (markerIndex === -1) return message

	const beforeError = message.text.slice(0, markerIndex)
	const trimmedEnd = beforeError.trimEnd().length

	return message.slice(0, trimmedEnd)
}

function getErrorMessageToRender(
	error: unknown,
	errorId: string | undefined,
): FormattedString {
	if (error instanceof ErrorToRender) {
		return error.messageToRender
	}

	if (errorId === undefined) return fmt`${GENERIC_ERROR_MESSAGE}`

	return fmt`${GENERIC_ERROR_MESSAGE}\nError ID: ${errorId}`
}

function errorMessageToRender(rawErrorMessage: string): FormattedString {
	return fmt`${errorPrefixToRender} ${rawErrorMessage}`
}
