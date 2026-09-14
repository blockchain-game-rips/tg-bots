import {
	INIT_DATA_MAX_AGE_SECONDS,
	INIT_DATA_MAX_SKEW_SECONDS,
	signInitData,
	verifyInitData,
} from '@rips/grammy-kit'
import { describe, expect, it } from 'vitest'

const BOT_TOKEN = 'test-bot-token:AAHrandom'
const TELEGRAM_ID = 4242

const MILLISECONDS_PER_SECOND = 1000

const WELL_INSIDE_WINDOW_SECONDS = 10

const REJECTED_SKEW_SECONDS = 120
const ACCEPTED_SKEW_SECONDS = 30

const nowSeconds = () => Math.floor(Date.now() / MILLISECONDS_PER_SECOND)

const signedUser = (
	overrides: Record<string, string> = {},
	token: string = BOT_TOKEN,
) =>
	signInitData(
		{
			user: JSON.stringify({ id: TELEGRAM_ID, first_name: 'Ada' }),
			auth_date: String(nowSeconds()),
			...overrides,
		},
		token,
	)

describe('verifying initData', () => {
	it('extracts the telegram id from a correctly signed payload', () => {
		const result = verifyInitData(signedUser(), BOT_TOKEN)

		expect(result).toEqual({ telegramId: TELEGRAM_ID })
	})

	it('rejects a payload carrying no hash at all', () => {
		const unsigned = new URLSearchParams({
			user: JSON.stringify({ id: TELEGRAM_ID }),
			auth_date: String(nowSeconds()),
		}).toString()

		expect(verifyInitData(unsigned, BOT_TOKEN)).toBeUndefined()
	})

	it('rejects a payload whose fields were tampered with after signing', () => {
		const params = new URLSearchParams(signedUser())

		params.set('user', JSON.stringify({ id: TELEGRAM_ID + 1 }))

		expect(verifyInitData(params.toString(), BOT_TOKEN)).toBeUndefined()
	})

	it('rejects a payload signed with a different bot token', () => {
		const foreign = signedUser()

		expect(verifyInitData(foreign, 'another-token')).toBeUndefined()
	})

	it('rejects a payload older than the freshness window', () => {
		const stale = signedUser({
			auth_date: String(nowSeconds() - INIT_DATA_MAX_AGE_SECONDS - 1),
		})

		expect(verifyInitData(stale, BOT_TOKEN)).toBeUndefined()
	})

	it('accepts a payload inside the freshness window', () => {
		const recent = signedUser({
			auth_date: String(
				nowSeconds() -
					INIT_DATA_MAX_AGE_SECONDS +
					WELL_INSIDE_WINDOW_SECONDS,
			),
		})

		expect(verifyInitData(recent, BOT_TOKEN)).toEqual({
			telegramId: TELEGRAM_ID,
		})
	})

	/**
	 * Ahead of the clock is bounded far more tightly than behind it: the only
	 * legitimate reason for a future stamp is clock disagreement, so the replay
	 * window must not double as the tolerance for it.
	 */
	it('rejects a payload stamped further ahead than clock skew explains', () => {
		const ahead = signedUser({
			auth_date: String(nowSeconds() + REJECTED_SKEW_SECONDS),
		})

		expect(verifyInitData(ahead, BOT_TOKEN)).toBeUndefined()
	})

	it('rejects a payload stamped beyond the skew allowance but inside the age window', () => {
		const ahead = signedUser({
			auth_date: String(nowSeconds() + INIT_DATA_MAX_SKEW_SECONDS + 1),
		})

		expect(verifyInitData(ahead, BOT_TOKEN)).toBeUndefined()
	})

	it('tolerates the small clock skew between Telegram and this process', () => {
		const slightlyAhead = signedUser({
			auth_date: String(nowSeconds() + ACCEPTED_SKEW_SECONDS),
		})

		expect(verifyInitData(slightlyAhead, BOT_TOKEN)).toEqual({
			telegramId: TELEGRAM_ID,
		})
	})

	it('rejects a payload with no user field, since the telegram id is the point', () => {
		const noUser = signInitData(
			{ auth_date: String(nowSeconds()) },
			BOT_TOKEN,
		)

		expect(verifyInitData(noUser, BOT_TOKEN)).toBeUndefined()
	})

	it('rejects a payload whose user field is not valid JSON', () => {
		const brokenUser = signInitData(
			{
				user: 'not-json',
				auth_date: String(nowSeconds()),
			},
			BOT_TOKEN,
		)

		expect(verifyInitData(brokenUser, BOT_TOKEN)).toBeUndefined()
	})

	it('rejects a payload whose auth_date is missing', () => {
		const noDate = signInitData(
			{
				user: JSON.stringify({ id: TELEGRAM_ID }),
			},
			BOT_TOKEN,
		)

		expect(verifyInitData(noDate, BOT_TOKEN)).toBeUndefined()
	})
})
