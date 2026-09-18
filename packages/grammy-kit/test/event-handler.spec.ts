import { FormattedString } from '@grammyjs/parse-mode'
import {
	BoundAction,
	createEventHandler,
	EffectType,
	initialSession,
	PageContent,
	SessionData,
} from '@rips/grammy-kit'
import { Api, InlineKeyboard, MemorySessionStorage } from 'grammy'

const TELEGRAM_ID = 4242
const FIRST_SENT_MESSAGE_ID = 500
const EXISTING_MESSAGE_ID = 11
const EXISTING_INTERACTION = 1

/**
 * The adapter keys the session the way grammy's `defaultGetSessionKey` does, by
 * chat id — which in a private chat is the telegram id.
 */
const SESSION_KEY = String(TELEGRAM_ID)

const makePage = (text: string): PageContent => ({
	message: new FormattedString(text, []),
	keyboard: new InlineKeyboard(),
})

interface FakeApi {
	api: Api
	sentTexts: string[]
}

const makeApi = (): FakeApi => {
	const sentTexts: string[] = []

	let nextMessageId = FIRST_SENT_MESSAGE_ID

	const api = {
		sendMessage: (_chatId: number, text: string) => {
			sentTexts.push(text)

			return Promise.resolve({ message_id: nextMessageId++ })
		},

		editMessageText: (
			_chatId: number,
			_messageId: number,
			text: string,
		) => {
			sentTexts.push(text)

			return Promise.resolve({ message_id: FIRST_SENT_MESSAGE_ID })
		},
	}

	return { api: api as unknown as Api, sentTexts }
}

const navigatingTo = (text: string): BoundAction => ({
	decode: (raw: string) => raw,
	handler: () => ({
		flow: { kind: 'hold' as const },
		effect: { type: EffectType.NAVIGATE, page: makePage(text) },
	}),
})

const failing = (): BoundAction => ({
	decode: (raw: string) => raw,
	handler: () => {
		throw new Error('boom')
	},
})

const VERDICT_ACTION = { actionId: 'verdict', payload: undefined }

const setup = (verdict: BoundAction = navigatingTo('welcome')) => {
	const fake = makeApi()
	const storage = new MemorySessionStorage<SessionData>()

	const handleEvent = createEventHandler({
		api: fake.api,
		storage,
		initial: initialSession,
		actions: { verdict },
	})

	return {
		fake,
		storage,
		sendEvent: () =>
			handleEvent({ telegramId: TELEGRAM_ID, action: VERDICT_ACTION }),
	}
}

const existingWorkspace = () => ({
	messageId: EXISTING_MESSAGE_ID,
	lastInteraction: EXISTING_INTERACTION,
	lastAsk: null,
	flow: null,
	lastNavigatedPage: null,
	history: [],
	isProcessing: false,
})

describe('driving the bot from an event with no update', () => {
	it('lands a page in the chat named by the event', async () => {
		const { fake, sendEvent } = setup()

		await sendEvent()

		expect(fake.sentTexts).toEqual(['welcome'])
	})

	it('writes the workspace it opened back to the storage the middleware reads', async () => {
		const { storage, sendEvent } = setup()

		await sendEvent()

		const stored = storage.read(SESSION_KEY)

		expect(stored?.workspaces).toHaveLength(1)
		expect(stored?.workspaces[0]?.messageId).toBe(FIRST_SENT_MESSAGE_ID)
	})

	it('starts from the session already in storage rather than a blank one', async () => {
		const { storage, sendEvent } = setup()

		const existing = initialSession()
		existing.workspaces.push(existingWorkspace())

		storage.write(SESSION_KEY, existing)

		await sendEvent()

		const stored = storage.read(SESSION_KEY)

		expect(stored?.workspaces).toHaveLength(2)
		expect(stored?.workspaces[0]?.messageId).toBe(EXISTING_MESSAGE_ID)
	})

	it('shows the error on the fallback page when the action fails', async () => {
		const { fake, sendEvent } = setup(failing())

		await sendEvent()

		// the executor delivers the error page without awaiting it
		await Promise.resolve()

		expect(fake.sentTexts.join('')).toContain('Error ID')
	})
})

describe('an event landing while a button press holds the same session', () => {
	it('keeps the event workspace when the press already had a session', async () => {
		const { storage, sendEvent } = setup()

		storage.write(SESSION_KEY, initialSession())

		const heldByPress = storage.read(SESSION_KEY)

		await sendEvent()

		if (heldByPress !== undefined) {
			storage.write(SESSION_KEY, heldByPress)
		}

		expect(storage.read(SESSION_KEY)?.workspaces).toHaveLength(1)
	})

	it('still delivers the page when a press is opening the chat, though that press drops the workspace', async () => {
		const { fake, storage, sendEvent } = setup()

		// grammy initialises a fresh session in memory and writes it only when
		// its middleware finishes, so storage is still empty while the press runs
		const heldByPress = storage.read(SESSION_KEY) ?? initialSession()

		await sendEvent()

		expect(fake.sentTexts).toEqual(['welcome'])
		expect(storage.read(SESSION_KEY)?.workspaces).toHaveLength(1)

		storage.write(SESSION_KEY, heldByPress)

		// the accepted race documented on createEventHandler: an opening press
		// overwrites the session the event seeded
		expect(storage.read(SESSION_KEY)?.workspaces).toHaveLength(0)
	})
})
