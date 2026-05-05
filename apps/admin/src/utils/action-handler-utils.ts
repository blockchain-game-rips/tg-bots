import { ApiError } from './api-error'

export function isApiErrorWithStatus(
	error: unknown,
	statusCode: number,
): error is ApiError {
	return error instanceof ApiError && error.status === statusCode
}
