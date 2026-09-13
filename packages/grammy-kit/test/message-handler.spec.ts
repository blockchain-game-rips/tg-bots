import { Api } from 'grammy'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../src/effects/effect-executor', () => ({
	executeEffectOrDisplayError: vi.fn(),
}))

import { executeEffectOrDisplayError } from '../src/effects/effect-executor'
import {
	createMessageHandler,
	parseDocumentPayload,
} from '../src/handlers/message-handler'
import { initialSession, resolveWorkspace } from '../src/session/workspaces'
import { ActionId, SessionData } from '../src/types'

const executeMock = vi.mocked(executeEffectOrDisplayError)

const BOT_ID = 42
const CHAT_ID = 7
const TELEGRAM_ID = 99
const WORKSPACE_MESSAGE_ID = 100
const PROMPT_MESSAGE_ID = 101
const SUBMIT_MESSAGE_ID = 102
const SUBMIT_ACTION = 'submit' as ActionId<unknown>
const FILE_ID = 'BQACAgIAAxkBAAitermsfile'

const BOT_TOKEN = 'test-token'

// The executor is mocked, so the api is only ever forwarded, never called.
const bot: { api: Api } = { api: new Api(BOT_TOKEN) }

const sessionAwaitingReply = (): SessionData => {
	const session = initialSession()

	resolveWorkspace(session, WORKSPACE_MESSAGE_ID).lastAsk = {
		onSubmit: SUBMIT_ACTION,
		message: { messageId: WORKSPACE_MESSAGE_ID, hasPhoto: false },
		promptMessageId: PROMPT_MESSAGE_ID,
	}

	return session
}

/**
 * The slice of a submit context the handler actually reads. Spelling it out
 * keeps the fixtures free of casts through grammy's filtered context types.
 */
interface FakeSubmitContext {
	session: SessionData
	chat: { id: number }
	from: { id: number }
	me: { id: number }
	message: {
		message_id: number
		reply_to_message?: { message_id: number; from: { id: number } }
		text?: string
		document?: { file_id: string; file_name?: string }
	}
}

const contextWith = (
	message: Partial<FakeSubmitContext['message']>,
): FakeSubmitContext => ({
	session: sessionAwaitingReply(),
	chat: { id: CHAT_ID },
	from: { id: TELEGRAM_ID },
	me: { id: BOT_ID },
	message: {
		message_id: SUBMIT_MESSAGE_ID,
		reply_to_message: {
			message_id: PROMPT_MESSAGE_ID,
			from: { id: BOT_ID },
		},
		...message,
	},
})

/**
 * The one place the fixture is admitted as a real context. Grammy's filtered
 * context type cannot be built literally, and the handler reads only the fields
 * FakeSubmitContext declares, so the assertion is confined here.
 */
const handleSubmit = (
	handle: ReturnType<typeof createMessageHandler>,
	ctx: FakeSubmitContext,
): Promise<void> => handle(ctx as unknown as Parameters<typeof handle>[0], bot)

const payloadFromHandling = async (
	message: Partial<FakeSubmitContext['message']>,
): Promise<unknown> => {
	executeMock.mockClear()

	const handle = createMessageHandler({})

	await handleSubmit(handle, contextWith(message))

	const call: { action: { payload: unknown } } | undefined =
		executeMock.mock.calls[0]?.[0]

	return call?.action.payload
}

describe('submitting a reply to a prompt', () => {
	it('passes typed text through as the payload', async () => {
		expect(await payloadFromHandling({ text: 'US,GB' })).toBe('US,GB')
	})

	it('passes an uploaded document through as its file id', async () => {
		const payload = await payloadFromHandling({
			document: { file_id: FILE_ID, file_name: 'terms.pdf' },
		})

		expect(parseDocumentPayload(payload)).toEqual({
			fileId: FILE_ID,
			fileName: 'terms.pdf',
		})
	})

	it('carries the document name so a screen can name what was attached', async () => {
		const payload = await payloadFromHandling({
			document: { file_id: FILE_ID, file_name: 'q3-terms v2.pdf' },
		})

		expect(parseDocumentPayload(payload)?.fileName).toBe('q3-terms v2.pdf')
	})

	it('carries a document that arrives without a name', async () => {
		const payload = await payloadFromHandling({
			document: { file_id: FILE_ID },
		})

		expect(parseDocumentPayload(payload)).toEqual({
			fileId: FILE_ID,
			fileName: null,
		})
	})

	it('leaves typed text undecodable as a document', async () => {
		expect(parseDocumentPayload('US,GB')).toBe(null)
	})

	it('ignores a reply that carries neither text nor a document', async () => {
		expect(await payloadFromHandling({})).toBe(undefined)
	})
})

describe('the workspace lookup behind a reply', () => {
	it('ignores a message that replies to nothing', async () => {
		const handle = createMessageHandler({})
		executeMock.mockClear()

		const ctx = contextWith({ text: 'US' })
		ctx.message.reply_to_message = undefined

		await handleSubmit(handle, ctx)

		expect(executeMock).not.toHaveBeenCalled()
	})

	it('ignores a reply to a message the bot did not send', async () => {
		const handle = createMessageHandler({})
		executeMock.mockClear()

		const ctx = contextWith({
			text: 'US',
			reply_to_message: {
				message_id: PROMPT_MESSAGE_ID,
				from: { id: BOT_ID + 1 },
			},
		})

		await handleSubmit(handle, ctx)

		expect(executeMock).not.toHaveBeenCalled()
	})

	it('ignores a reply to a prompt no workspace is awaiting', async () => {
		const handle = createMessageHandler({})
		executeMock.mockClear()

		const ctx = contextWith({
			text: 'US',
			reply_to_message: {
				message_id: PROMPT_MESSAGE_ID + 1,
				from: { id: BOT_ID },
			},
		})

		await handleSubmit(handle, ctx)

		expect(executeMock).not.toHaveBeenCalled()
	})
})
