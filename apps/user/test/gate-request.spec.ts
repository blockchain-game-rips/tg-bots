import { signInitData } from '@rips/grammy-kit'
import { describe, expect, it, vi } from 'vitest'
import {
	EligibilityFact,
	handleGateRequest,
	HTTP_BAD_REQUEST,
	HTTP_OK,
	HTTP_UNAUTHORIZED,
	HTTP_UNPROCESSABLE,
} from '../src/gate/gate-request'

const BOT_TOKEN = 'gate-bot-token:AAtest'
const TELEGRAM_ID = 99001
const COUNTRY = 'DE'

const MILLISECONDS_PER_SECOND = 1000

const nowSeconds = () => Math.floor(Date.now() / MILLISECONDS_PER_SECOND)

const validInitData = () =>
	signInitData(
		{
			user: JSON.stringify({ id: TELEGRAM_ID, first_name: 'Ada' }),
			auth_date: String(nowSeconds()),
		},
		BOT_TOKEN,
	)

const setup = () => {
	const facts: EligibilityFact[] = []

	const onFact = vi.fn((fact: EligibilityFact) => {
		facts.push(fact)

		return Promise.resolve()
	})

	const send = (
		body: string,
		headers: Record<string, string | string[] | undefined> = {
			'cf-ipcountry': COUNTRY,
		},
	) =>
		handleGateRequest(
			{ headers, body },
			{
				botToken: BOT_TOKEN,
				devCountry: undefined,
				isDevelopment: false,
				onFact,
			},
		)

	return { facts, onFact, send }
}

const bodyWith = (initData: string) => JSON.stringify({ initData })

describe('the gate handling a mini app request', () => {
	it('hands the bot the telegram id and the country', async () => {
		const { facts, send } = setup()

		const response = await send(bodyWith(validInitData()))

		expect(response.status).toBe(HTTP_OK)
		expect(facts).toEqual([{ telegramId: TELEGRAM_ID, country: COUNTRY }])
	})

	it('takes the telegram id from the signature, never from the request body', async () => {
		const { facts, send } = setup()

		const claimed = JSON.stringify({
			initData: validInitData(),
			telegramId: 1,
		})

		await send(claimed)

		expect(facts[0]?.telegramId).toBe(TELEGRAM_ID)
	})

	it('reports a fact and names no screen', async () => {
		const { facts, send } = setup()

		await send(bodyWith(validInitData()))

		expect(Object.keys(facts[0] ?? {}).sort()).toEqual([
			'country',
			'telegramId',
		])
	})
})

describe('the gate refusing a request', () => {
	it('rejects an unsigned payload without telling the bot anything', async () => {
		const { onFact, send } = setup()

		const unsigned = new URLSearchParams({
			user: JSON.stringify({ id: TELEGRAM_ID }),
			auth_date: String(nowSeconds()),
		}).toString()

		const response = await send(bodyWith(unsigned))

		expect(response.status).toBe(HTTP_UNAUTHORIZED)
		expect(onFact).not.toHaveBeenCalled()
	})

	it('rejects a tampered payload', async () => {
		const { onFact, send } = setup()

		const params = new URLSearchParams(validInitData())
		params.set('user', JSON.stringify({ id: TELEGRAM_ID + 1 }))

		const response = await send(bodyWith(params.toString()))

		expect(response.status).toBe(HTTP_UNAUTHORIZED)
		expect(onFact).not.toHaveBeenCalled()
	})

	it('rejects a body that carries no initData', async () => {
		const { onFact, send } = setup()

		const response = await send(JSON.stringify({}))

		expect(response.status).toBe(HTTP_BAD_REQUEST)
		expect(onFact).not.toHaveBeenCalled()
	})

	it('rejects a body that is not JSON', async () => {
		const { onFact, send } = setup()

		const response = await send('not json at all')

		expect(response.status).toBe(HTTP_BAD_REQUEST)
		expect(onFact).not.toHaveBeenCalled()
	})

	it('reports an absent country rather than guessing one', async () => {
		const { onFact, send } = setup()

		const response = await send(bodyWith(validInitData()), {})

		expect(response.status).toBe(HTTP_UNPROCESSABLE)
		expect(onFact).not.toHaveBeenCalled()
	})

	it('says nothing about which half of the check failed', async () => {
		const { send } = setup()

		const response = await send(bodyWith('tampered'))

		expect(response.body).toBeUndefined()
	})
})

describe('the gate passing Cloudflare special values through', () => {
	it('hands XX to the bot verbatim', async () => {
		const { facts, send } = setup()

		await send(bodyWith(validInitData()), { 'cf-ipcountry': 'XX' })

		expect(facts[0]?.country).toBe('XX')
	})

	it('hands T1 to the bot verbatim', async () => {
		const { facts, send } = setup()

		await send(bodyWith(validInitData()), { 'cf-ipcountry': 'T1' })

		expect(facts[0]?.country).toBe('T1')
	})
})
