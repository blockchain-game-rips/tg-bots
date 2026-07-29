import { ErrorToRender } from '@rips/grammy-kit'
import z, { ZodType } from 'zod'

export const numericIdSchema = z
	.string()
	.transform(Number)
	.pipe(z.number().int().positive())

export function parsePayload<T>(
	payload: string | undefined,
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
