interface ApiErrorBody {
	statusCode: number
	message: string
}

function isApiErrorBody(body: unknown): body is ApiErrorBody {
	return (
		typeof body === 'object' &&
		body !== null &&
		'statusCode' in body &&
		'message' in body
	)
}

export class ApiError extends Error {
	constructor(
		public readonly status: number,
		public readonly body: unknown,
	) {
		super(isApiErrorBody(body) ? body.message : `API error ${status}`)
	}
}
