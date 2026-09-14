import { FormattedString } from '@grammyjs/parse-mode'
import { Api, InputMediaBuilder } from 'grammy'
import { Media, Message, MediaPage, PageContent, TextPage } from '../types'

/** A message together with the chat it lives in, so the two cannot drift. */
export interface ChatMessage {
	chatId: number
	message: Message
}

export function captionArgs(message: FormattedString) {
	return {
		caption: message.caption,
		caption_entities: message.caption_entities,
	}
}

function toInputMedia(media: Media, message: FormattedString) {
	switch (media.kind) {
		case 'photo':
			return InputMediaBuilder.photo(media.file, captionArgs(message))

		case 'document':
			return InputMediaBuilder.document(media.file, captionArgs(message))
	}
}

export async function replacePage(
	api: Api,
	target: ChatMessage,
	newPage: PageContent,
): Promise<Message> {
	const { chatId, message } = target
	const newPageHasMedia = newPage.media !== undefined

	if (message.hasMedia && newPageHasMedia) {
		await editMedia(api, target, newPage)

		return message
	}

	if (!message.hasMedia && !newPageHasMedia) {
		await editText(api, target, newPage)

		return message
	}

	const [, sentMessageId] = await Promise.all([
		api.deleteMessage(chatId, message.messageId),
		sendMessage(api, chatId, newPage),
	])

	return {
		messageId: sentMessageId,
		hasMedia: newPageHasMedia,
	}
}

async function editMedia(api: Api, target: ChatMessage, newPage: MediaPage) {
	await api.editMessageMedia(
		target.chatId,
		target.message.messageId,
		toInputMedia(newPage.media, newPage.message),
		{ reply_markup: newPage.keyboard },
	)
}

async function editText(api: Api, target: ChatMessage, newPage: TextPage) {
	await api.editMessageText(
		target.chatId,
		target.message.messageId,
		newPage.message.text,
		{
			reply_markup: newPage.keyboard,
			entities: newPage.message.entities,
		},
	)
}

export async function sendMessage(
	api: Api,
	chatId: number,
	newPage: PageContent,
): Promise<number> {
	const { keyboard, message, media } = newPage

	if (media !== undefined) {
		const sent = await sendMedia(api, chatId, media, newPage)

		return sent.message_id
	}

	const sentMessage = await api.sendMessage(chatId, message.text, {
		reply_markup: keyboard,
		entities: message.entities,
	})

	return sentMessage.message_id
}

function sendMedia(api: Api, chatId: number, media: Media, newPage: MediaPage) {
	const other = {
		...captionArgs(newPage.message),
		reply_markup: newPage.keyboard,
	}

	switch (media.kind) {
		case 'photo':
			return api.sendPhoto(chatId, media.file, other)

		case 'document':
			return api.sendDocument(chatId, media.file, other)
	}
}
