import { tryParseJson, verifyInitData } from '@rips/grammy-kit'
import { requestCountry } from './request-country'

/**
 * What the gate hands the bot: a fact, not a message. The gate names no screen,
 * because what to show next depends on session state it does not have.
 *
 * `telegramId` comes from verified `initData` only — never from the request
 * body, which a caller controls.
 */
export interface EligibilityFact {
	telegramId: number
	country: string
}

export interface GateResponse {
	status: number
	body?: string
}

export interface GateRequestOptions {
	botToken: string
	onFact: (fact: EligibilityFact) => Promise<void>
}

export const HTTP_OK = 200
export const HTTP_BAD_REQUEST = 400
export const HTTP_UNAUTHORIZED = 401
export const HTTP_UNPROCESSABLE = 422

interface IncomingGateRequest {
	headers: Record<string, string | string[] | undefined>
	body: string
}

/**
 * The whole of the gate's policy: prove the caller is who they claim, observe
 * where the request came from, hand both to the bot.
 *
 * Every rejection is a bare status with no body — the mini app shows one error
 * for any failure, and saying more would only tell an unverified caller which
 * half of the check it failed.
 */
export async function handleGateRequest(
	request: IncomingGateRequest,
	{ botToken, onFact }: GateRequestOptions,
): Promise<GateResponse> {
	const initData = readInitData(request.body)

	if (initData === undefined) return { status: HTTP_BAD_REQUEST }

	const verified = verifyInitData(initData, botToken)

	if (verified === undefined) return { status: HTTP_UNAUTHORIZED }

	const country = requestCountry(request)

	// No fallback source, so an absent country is reported rather than guessed.
	if (country === undefined) return { status: HTTP_UNPROCESSABLE }

	await onFact({ telegramId: verified.telegramId, country })

	return { status: HTTP_OK }
}

function readInitData(body: string): string | undefined {
	const parsed: unknown = tryParseJson(body)

	if (typeof parsed !== 'object' || parsed === null) return undefined

	if (!('initData' in parsed)) return undefined

	const { initData } = parsed

	if (typeof initData !== 'string' || initData === '') return undefined

	return initData
}
