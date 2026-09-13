import { ApiError } from '@rips/api-client'
import { ErrorToRender } from '@rips/grammy-kit'
import { z } from 'zod'

/** Both the local parser and a backend rejection end on this, since neither writes partially. */
export const NOTHING_CHANGED = 'Nothing was changed.'

/**
 * The backend rejects the whole list on one bad code and names each offender in
 * a per-issue message, while the top-level message stays a generic "Validation
 * failed". Reading the issues is what turns that into something an operator can
 * act on.
 */
const validationBodySchema = z.object({
	message: z.string().optional(),
	errors: z.array(z.object({ message: z.string() })).optional(),
})

/**
 * Runs a policy write, restating a rejection in terms the operator can act on.
 * Anything that is not an API rejection is rethrown untouched, so it still logs
 * and renders as an unexpected failure.
 */
export async function policyWrite<T>(write: () => Promise<T>): Promise<T> {
	try {
		return await write()
	} catch (error) {
		throw toPolicyWriteError(error)
	}
}

export function toPolicyWriteError(error: unknown): unknown {
	if (!(error instanceof ApiError)) return error

	const body = validationBodySchema.safeParse(error.body)

	if (!body.success) return error

	const issues = body.data.errors ?? []

	if (issues.length > 0) {
		const reasons = issues.map((issue) => issue.message).join('\n')

		return new ErrorToRender(
			`${reasons}\n${NOTHING_CHANGED}`,
			error.message,
		)
	}

	const message = body.data.message

	if (message === undefined) return error

	return new ErrorToRender(message, error.message)
}
