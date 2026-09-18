import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Typed by the one argument these tests read back, so asserting which workspace
 * a press reached needs no cast.
 */
const executeEffectOrDisplayError = vi.hoisted(() =>
	vi.fn<(args: { workspace: { messageId: number } }) => Promise<void>>(),
)

vi.mock('../src/effects/effect-executor', () => ({
	executeEffectOrDisplayError,
}))

import { createButtonHandler } from '../src/handlers/button-handler'
import { initialSession } from '../src/session/workspaces'
import { SessionData } from '../src/types'

const USER_ID = 42
const CHAT_ID = 100
const FIRST_MESSAGE_ID = 7
const SECOND_MESSAGE_ID = 9
const ACTION_ID = 'a'

interface Deferred {
	resolve: () => void
	promise: Promise<void>
}

function defer(): Deferred {
	let resolve: () => void = () => undefined

	const promise = new Promise<void>((resolvePromise) => {
		resolve = () => {
			resolvePromise()
		}
	})

	return { resolve, promise }
}

const answerCallbackQuery = vi.fn(() => Promise.resolve(true))

function buildContext(session: SessionData, messageId: number) {
	return {
		from: { id: USER_ID },
		api: {},
		session,
		answerCallbackQuery,
		callbackQuery: {
			data: ACTION_ID,
			message: {
				message_id: messageId,
				chat: { id: CHAT_ID },
				text: 'page',
				entities: [],
				reply_markup: { inline_keyboard: [] },
			},
		},
		// the handler only reads the fields above; the rest of grammy's context
		// never takes part in the locking behaviour under test
	} as unknown as Parameters<ReturnType<typeof createButtonHandler>>[0]
}

describe('button handler locking', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('runs presses on separate workspaces concurrently', async () => {
		const session = initialSession()
		const handleButton = createButtonHandler({})

		const first = defer()
		executeEffectOrDisplayError.mockImplementationOnce(() => first.promise)
		executeEffectOrDisplayError.mockImplementationOnce(() =>
			Promise.resolve(),
		)

		const firstPress = handleButton(buildContext(session, FIRST_MESSAGE_ID))

		await handleButton(buildContext(session, SECOND_MESSAGE_ID))

		const workspacesReached = executeEffectOrDisplayError.mock.calls.map(
			([{ workspace }]) => workspace.messageId,
		)

		expect(workspacesReached).toEqual([FIRST_MESSAGE_ID, SECOND_MESSAGE_ID])

		first.resolve()
		await firstPress
	})

	it('drops a second press on the workspace already processing', async () => {
		const session = initialSession()
		const handleButton = createButtonHandler({})

		const first = defer()
		executeEffectOrDisplayError.mockImplementationOnce(() => first.promise)

		const firstPress = handleButton(buildContext(session, FIRST_MESSAGE_ID))

		await handleButton(buildContext(session, FIRST_MESSAGE_ID))

		expect(executeEffectOrDisplayError).toHaveBeenCalledTimes(1)

		first.resolve()
		await firstPress
	})

	/**
	 * The regression a per-user lock caused: it froze every message in the chat
	 * while one was working, so only a workspace-scoped lock passes this.
	 */
	it('leaves the other workspace free while one is busy', async () => {
		const session = initialSession()
		const handleButton = createButtonHandler({})

		const first = defer()
		executeEffectOrDisplayError.mockImplementationOnce(() => first.promise)

		const firstPress = handleButton(buildContext(session, FIRST_MESSAGE_ID))

		await handleButton(buildContext(session, SECOND_MESSAGE_ID))
		await handleButton(buildContext(session, SECOND_MESSAGE_ID))

		expect(executeEffectOrDisplayError).toHaveBeenCalledTimes(3)

		first.resolve()
		await firstPress
	})

	it('answers the dropped press so its spinner stops', async () => {
		const session = initialSession()
		const handleButton = createButtonHandler({})

		const first = defer()
		executeEffectOrDisplayError.mockImplementationOnce(() => first.promise)

		const firstPress = handleButton(buildContext(session, FIRST_MESSAGE_ID))

		answerCallbackQuery.mockClear()

		await handleButton(buildContext(session, FIRST_MESSAGE_ID))

		expect(answerCallbackQuery).toHaveBeenCalledTimes(1)

		first.resolve()
		await firstPress
	})

	it('releases the workspace once the press settles', async () => {
		const session = initialSession()
		const handleButton = createButtonHandler({})

		executeEffectOrDisplayError.mockRejectedValueOnce(new Error('boom'))
		executeEffectOrDisplayError.mockResolvedValueOnce(undefined)

		await handleButton(buildContext(session, FIRST_MESSAGE_ID))
		await handleButton(buildContext(session, FIRST_MESSAGE_ID))

		expect(executeEffectOrDisplayError).toHaveBeenCalledTimes(2)
	})
})
