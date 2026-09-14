import { createHmac } from 'node:crypto'

/**
 * Builds `initData` the way Telegram does, for tests.
 *
 * Deliberately an independent implementation of the documented algorithm rather
 * than a call into `verifyInitData`: a fixture built by the code under test
 * would agree with it no matter what either of them did. Kept beside the
 * verifier so both are read together, and exported so the app tests that post
 * signed payloads sign them the same way.
 */
const SECRET_KEY_LABEL = 'WebAppData'

const HASH_FIELD = 'hash'

export function signInitData(
	fields: Record<string, string>,
	botToken: string,
): string {
	const params = new URLSearchParams(fields)

	const dataCheckString = [...params.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, value]) => `${key}=${value}`)
		.join('\n')

	const secret = createHmac('sha256', SECRET_KEY_LABEL)
		.update(botToken)
		.digest()

	const hash = createHmac('sha256', secret)
		.update(dataCheckString)
		.digest('hex')

	params.set(HASH_FIELD, hash)

	return params.toString()
}
