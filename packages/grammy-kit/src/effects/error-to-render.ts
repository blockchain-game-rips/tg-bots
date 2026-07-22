import { fmt, FormattedString } from '@grammyjs/parse-mode'
import { PageContent } from '../types'

const errorPrefixToRender = '❌ Error:'

export class ErrorToRender extends Error {
	messageToRender: FormattedString

	constructor(rawMessageToRender: string, message?: string) {
		super(message)

		this.messageToRender = errorMessageToRender(rawMessageToRender)
	}
}

export function composePageContentWithError(
	currentPageContent: PageContent,
	error: unknown,
): PageContent {
	const errorMessage = getErrorMessageToRender(error)

	const baseMessage = stripExistingError(currentPageContent.message)

	const message = fmt`${baseMessage}\n\n${errorMessage}`

	return { ...currentPageContent, message }
}

function stripExistingError(message: FormattedString): FormattedString {
	const errorIndex = message.text.indexOf(errorPrefixToRender)

	if (errorIndex === -1) return message

	const beforeError = message.text.slice(0, errorIndex)
	const trimmedEnd = beforeError.trimEnd().length

	return message.slice(0, trimmedEnd)
}

function getErrorMessageToRender(error: unknown): FormattedString {
	if (error instanceof ErrorToRender) {
		return error.messageToRender
	}

	return errorMessageToRender(
		'Internal server error, try again or summon a new menu',
	)
}

function errorMessageToRender(rawErrorMessage: string): FormattedString {
	return fmt`${errorPrefixToRender} ${rawErrorMessage}`
}
