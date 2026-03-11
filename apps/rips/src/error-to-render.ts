export class ErrorToRender extends Error {
	constructor(
		readonly messageToRender: string,
		message?: string,
	) {
		super(message)
	}
}

export function getErrorMessageToRender(error: unknown) {
	if (error instanceof ErrorToRender) {
		return error.messageToRender
	}

	return '❌ Internal server error, try again or summon a new menu'
}
