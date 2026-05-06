import { ZodType } from 'zod'
import { ErrorToRender } from '../utils/error-to-render'

export function parsePayload<T>(
	payload: string,
	schema: ZodType<T>,
	defaultErrorMsgToRender: string,
): T {
	const result = schema.safeParse(payload)

	if (!result.success) {
		throw new ErrorToRender(
			result.error.issues[0]?.message ?? defaultErrorMsgToRender,
		)
	}

	return result.data
}
