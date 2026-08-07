import { FormattedString } from '@grammyjs/parse-mode'
import { Api, InputMediaBuilder } from 'grammy'
import { Message, MessageRef, PageContent, PhotoPage, TextPage } from '../types'

function captionArgs(message: FormattedString) {
	return {
		caption: message.caption,
		caption_entities: message.caption_entities,
	}
}

export async function replacePage(
	api: Api,
	message: Message,
	newPage: PageContent,
): Promise<Message> {
	const newPageHasPhoto = newPage.photo !== undefined

	if (message.hasPhoto && newPageHasPhoto) {
		await editMedia(api, message, newPage)

		return message
	}

	if (!message.hasPhoto && !newPageHasPhoto) {
		await editText(api, message, newPage)

		return message
	}

	const [, sentMessageId] = await Promise.all([
		api.deleteMessage(message.chatId, message.messageId),
		sendMessage(api, message.chatId, newPage),
	])

	return {
		chatId: message.chatId,
		messageId: sentMessageId,
		hasPhoto: newPageHasPhoto,
	}
}

async function editMedia(api: Api, ref: MessageRef, newPage: PhotoPage) {
	await api.editMessageMedia(
		ref.chatId,
		ref.messageId,
		InputMediaBuilder.photo(newPage.photo, captionArgs(newPage.message)),
		{ reply_markup: newPage.keyboard },
	)
}

async function editText(api: Api, ref: MessageRef, newPage: TextPage) {
	await api.editMessageText(ref.chatId, ref.messageId, newPage.message.text, {
		reply_markup: newPage.keyboard,
		entities: newPage.message.entities,
	})
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
