import { FormattedString } from '@grammyjs/parse-mode'
import {
	Message,
	PageContent,
	replacePage,
	sendMessage,
} from '@rips/grammy-kit'
import { Api, InlineKeyboard, InputFile } from 'grammy'

const CHAT_ID = 100
const MESSAGE_ID = 7
const SENT_MESSAGE_ID = 8

const textPage = (text: string): PageContent => ({
	message: new FormattedString(text, []),
	keyboard: new InlineKeyboard(),
})

const photoPage = (text: string): PageContent => ({
	...textPage(text),
	media: { kind: 'photo', file: new InputFile(Buffer.from('image')) },
})

const documentPage = (text: string): PageContent => ({
	...textPage(text),
	media: { kind: 'document', file: new InputFile(Buffer.from('report')) },
})

const onScreen = (hasMedia: boolean): Message => ({
	messageId: MESSAGE_ID,
	hasMedia,
})

interface EditedMedia {
	type: string
	caption: string | undefined
}

interface FakeApi {
	api: Api
	editedTexts: string[]
	editedMedia: EditedMedia[]
	sentPhotos: string[]
	sentDocuments: string[]
	deleted: number[]
}

const makeApi = (): FakeApi => {
	const editedTexts: string[] = []
	const editedMedia: EditedMedia[] = []
	const sentPhotos: string[] = []
	const sentDocuments: string[] = []
	const deleted: number[] = []

	const api = {
		editMessageText: (
			_chatId: number,
			_messageId: number,
			text: string,
		) => {
			editedTexts.push(text)

			return Promise.resolve({ message_id: MESSAGE_ID })
		},

		editMessageMedia: (
			_chatId: number,
			_messageId: number,
			media: { type: string; caption?: string },
		) => {
			editedMedia.push({ type: media.type, caption: media.caption })

			return Promise.resolve({ message_id: MESSAGE_ID })
		},

		sendPhoto: (
			_chatId: number,
			_photo: InputFile,
			other?: { caption?: string },
		) => {
			sentPhotos.push(other?.caption ?? '')

			return Promise.resolve({ message_id: SENT_MESSAGE_ID })
		},

		sendDocument: (
			_chatId: number,
			_document: InputFile,
			other?: { caption?: string },
		) => {
			sentDocuments.push(other?.caption ?? '')

			return Promise.resolve({ message_id: SENT_MESSAGE_ID })
		},

		sendMessage: (_chatId: number, text: string) => {
			editedTexts.push(text)

			return Promise.resolve({ message_id: SENT_MESSAGE_ID })
		},

		deleteMessage: (_chatId: number, messageId: number) => {
			deleted.push(messageId)

			return Promise.resolve(true)
		},
	}

	return {
		api: api as unknown as Api,
		editedTexts,
		editedMedia,
		sentPhotos,
		sentDocuments,
		deleted,
	}
}

describe('replacePage between pages of the same shape', () => {
	it('edits the text in place, leaving the message where it is', async () => {
		const fake = makeApi()

		const message = await replacePage(
			fake.api,
			{ chatId: CHAT_ID, message: onScreen(false) },
			textPage('second'),
		)

		expect(fake.editedTexts).toEqual(['second'])
		expect(fake.deleted).toEqual([])
		expect(message.messageId).toBe(MESSAGE_ID)
	})

	it('edits a photo in place rather than resending it', async () => {
		const fake = makeApi()

		const message = await replacePage(
			fake.api,
			{ chatId: CHAT_ID, message: onScreen(true) },
			photoPage('second'),
		)

		expect(fake.editedMedia).toEqual([{ type: 'photo', caption: 'second' }])
		expect(fake.deleted).toEqual([])
		expect(message.messageId).toBe(MESSAGE_ID)
	})

	it('edits a document in place, exactly as it does a photo', async () => {
		const fake = makeApi()

		const message = await replacePage(
			fake.api,
			{ chatId: CHAT_ID, message: onScreen(true) },
			documentPage('second'),
		)

		expect(fake.editedMedia).toEqual([
			{ type: 'document', caption: 'second' },
		])
		expect(fake.deleted).toEqual([])
		expect(message.messageId).toBe(MESSAGE_ID)
	})

	it('swaps a photo for a document in place, since both are media', async () => {
		const fake = makeApi()

		await replacePage(
			fake.api,
			{ chatId: CHAT_ID, message: onScreen(true) },
			documentPage('now a file'),
		)

		expect(fake.deleted).toEqual([])
	})
})

describe('replacePage across the text and media divide', () => {
	it('recreates the message when a photo replaces text', async () => {
		const fake = makeApi()

		const message = await replacePage(
			fake.api,
			{ chatId: CHAT_ID, message: onScreen(false) },
			photoPage('now a photo'),
		)

		expect(fake.deleted).toEqual([MESSAGE_ID])
		expect(fake.sentPhotos).toEqual(['now a photo'])
		expect(message).toEqual({
			messageId: SENT_MESSAGE_ID,
			hasMedia: true,
		})
	})

	it('recreates the message when a document replaces text', async () => {
		const fake = makeApi()

		const message = await replacePage(
			fake.api,
			{ chatId: CHAT_ID, message: onScreen(false) },
			documentPage('now a file'),
		)

		expect(fake.deleted).toEqual([MESSAGE_ID])
		expect(fake.sentDocuments).toEqual(['now a file'])
		expect(message).toEqual({
			messageId: SENT_MESSAGE_ID,
			hasMedia: true,
		})
	})

	it('recreates the message when text replaces a document', async () => {
		const fake = makeApi()

		const message = await replacePage(
			fake.api,
			{ chatId: CHAT_ID, message: onScreen(true) },
			textPage('back to text'),
		)

		expect(fake.deleted).toEqual([MESSAGE_ID])
		expect(message).toEqual({
			messageId: SENT_MESSAGE_ID,
			hasMedia: false,
		})
	})
})

describe('sendMessage', () => {
	it('sends a document as a document, not as a photo', async () => {
		const fake = makeApi()

		const messageId = await sendMessage(
			fake.api,
			CHAT_ID,
			documentPage('report'),
		)

		expect(fake.sentDocuments).toEqual(['report'])
		expect(fake.sentPhotos).toEqual([])
		expect(messageId).toBe(SENT_MESSAGE_ID)
	})

	it('sends a photo as a photo', async () => {
		const fake = makeApi()

		await sendMessage(fake.api, CHAT_ID, photoPage('qr'))

		expect(fake.sentPhotos).toEqual(['qr'])
		expect(fake.sentDocuments).toEqual([])
	})
})
