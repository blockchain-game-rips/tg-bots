import { FormattedString } from '@grammyjs/parse-mode'
import { Api, InputMediaBuilder } from 'grammy'
import { Message, PageContent, PhotoPage, TextPage } from '../types'

/** A message together with the chat it lives in, so the two cannot drift. */
export interface ChatMessage {
	chatId: number
	message: Message
}

function captionArgs(message: FormattedString) {
	return {
		caption: message.caption,
		caption_entities: message.caption_entities,
	}
}

export async function replacePage(
	api: Api,
	target: ChatMessage,
	newPage: PageContent,
): Promise<Message> {
	const { chatId, message } = target
	const newPageHasPhoto = newPage.photo !== undefined

	if (message.hasPhoto && newPageHasPhoto) {
		await editMedia(api, target, newPage)

		return message
	}

	if (!message.hasPhoto && !newPageHasPhoto) {
		await editText(api, target, newPage)

		return message
	}

	const [, sentMessageId] = await Promise.all([
		api.deleteMessage(chatId, message.messageId),
		sendMessage(api, chatId, newPage),
	])

	return {
		messageId: sentMessageId,
		hasPhoto: newPageHasPhoto,
	}
}

async function editMedia(api: Api, target: ChatMessage, newPage: PhotoPage) {
	await api.editMessageMedia(
		target.chatId,
		target.message.messageId,
		InputMediaBuilder.photo(newPage.photo, captionArgs(newPage.message)),
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
	const { keyboard, message, photo } = newPage

	if (photo !== undefined) {
		const sentPhoto = await api.sendPhoto(chatId, photo, {
			caption: message.caption,
			caption_entities: message.caption_entities,
			reply_markup: keyboard,
		})

		return sentPhoto.message_id
	}

	const sentMessage = await api.sendMessage(chatId, message.text, {
		reply_markup: keyboard,
		entities: message.entities,
	})

	return sentMessage.message_id
}
