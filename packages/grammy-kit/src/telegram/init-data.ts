import { Buffer } from 'node:buffer'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { tryParseJson } from '../utils/json'

/**
 * How old a signed `initData` payload may be. Telegram signs it when the mini
 * app opens, so this bounds how long a captured payload stays replayable rather
 * than how long the user may take.
 */
export const INIT_DATA_MAX_AGE_SECONDS = 300

/**
 * How far ahead of this process's clock a payload may be stamped. The only
 * reason to accept a future stamp at all is disagreement between Telegram's
 * clock and ours, which is far smaller than the replay window — so it gets its
 * own, tighter bound instead of borrowing the one above.
 */
export const INIT_DATA_MAX_SKEW_SECONDS = 60

const MILLISECONDS_PER_SECOND = 1000

/** Telegram derives the signing key from the bot token under this fixed label. */
const SECRET_KEY_LABEL = 'WebAppData'

const HASH_FIELD = 'hash'

/** What a verified payload is worth: the caller's identity, and nothing else. */
export interface VerifiedInitData {
	telegramId: number
}

/**
 * Telegram's documented `initData` check, hand-rolled on `node:crypto`.
 *
 * Returns the telegram id only when the signature is the bot token's own and the
 * payload is inside the freshness window; every failure is `undefined`, because
 * a caller that cannot act on the distinction should not be tempted to branch on
 * it. Anything derived from the payload is therefore signed — which is what lets
 * a public endpoint trust the id without believing the request body.
 */
export function verifyInitData(
	initData: string,
	botToken: string,
): VerifiedInitData | undefined {
	const params = new URLSearchParams(initData)

	const hash = params.get(HASH_FIELD)

	if (hash === null) return undefined

	params.delete(HASH_FIELD)

	if (!hasValidSignature(params, hash, botToken)) return undefined

	if (!isFresh(params.get('auth_date'))) return undefined

	return readUser(params.get('user'))
}

function hasValidSignature(
	params: URLSearchParams,
	hash: string,
	botToken: string,
): boolean {
	const dataCheckString = [...params.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, value]) => `${key}=${value}`)
		.join('\n')

	const secret = createHmac('sha256', SECRET_KEY_LABEL)
		.update(botToken)
		.digest()

	const expected = createHmac('sha256', secret)
		.update(dataCheckString)
		.digest('hex')

	return equalsInConstantTime(expected, hash)
}

/**
 * Compared without an early exit, so the time taken says nothing about how much
 * of a forged hash was right.
 */
function equalsInConstantTime(expected: string, actual: string): boolean {
	const expectedBytes = Buffer.from(expected, 'utf8')
	const actualBytes = Buffer.from(actual, 'utf8')

	if (expectedBytes.length !== actualBytes.length) return false

	return timingSafeEqual(expectedBytes, actualBytes)
}

function isFresh(authDate: string | null): boolean {
	if (authDate === null) return false

	const signedAtSeconds = Number(authDate)

	if (!Number.isFinite(signedAtSeconds)) return false

	const ageSeconds = Date.now() / MILLISECONDS_PER_SECOND - signedAtSeconds

	if (ageSeconds < 0) return -ageSeconds < INIT_DATA_MAX_SKEW_SECONDS

	return ageSeconds < INIT_DATA_MAX_AGE_SECONDS
}

/**
 * The id arrives as JSON inside a signed field, so it is parsed as unknown and
 * narrowed rather than trusted to have the documented shape.
 */
function readUser(rawUser: string | null): VerifiedInitData | undefined {
	if (rawUser === null) return undefined

	const parsed: unknown = tryParseJson(rawUser)

	if (typeof parsed !== 'object' || parsed === null) return undefined

	if (!('id' in parsed)) return undefined

	const { id } = parsed

	if (typeof id !== 'number' || !Number.isInteger(id)) return undefined

	return { telegramId: id }
}
