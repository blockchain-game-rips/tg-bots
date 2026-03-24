import { PageContent } from './types'

const errorPrefixToRender = '❌ Error:'
export class ErrorToRender extends Error {
	messageToRender: string

	constructor(rawMessageToRender: string, message?: string) {
		super(message)

		this.messageToRender = errorMessageToRender(rawMessageToRender)
	}
}

export function composePageContentWithError(
	currentPageContent: PageContent,
	error: unknown,
) {
	const errorMessageToRender = getErrorMessageToRender(error)

	const baseMessage = currentPageContent.message.includes(errorPrefixToRender)
		? currentPageContent.message.replace(
				/❌ Error:.*$/,
				errorMessageToRender,
			)
		: `${currentPageContent.message}\n\n${errorMessageToRender}`

	return { ...currentPageContent, message: baseMessage }
}

function getErrorMessageToRender(error: unknown) {
	if (error instanceof ErrorToRender) {
		return error.messageToRender
	}

	return errorMessageToRender(
		'Internal server error, try again or summon a new menu',
	)
}

function errorMessageToRender(rawErrorMessage: string) {
	return `${errorPrefixToRender} ${rawErrorMessage}`
}
