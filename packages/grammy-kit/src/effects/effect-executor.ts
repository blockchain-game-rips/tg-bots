import { Api, GrammyError, InputMediaBuilder } from 'grammy'
import { resolveEffect } from '../action/action-def'
import { BoundAction } from '../action/actions'
import { logger } from '../logging/pino-logger'
import {
	Effect,
	EffectType,
	MessageToEdit,
	PageContent,
	SessionData,
} from '../types'
import { fireAndForget } from '../utils/common'
import { composePageContentWithError, ErrorToRender } from './error-to-render'

const MESSAGE_NOT_MODIFIED = 'message is not modified'

function isMessageNotModifiedError(error: unknown): boolean {
	return (
		error instanceof GrammyError &&
		error.error_code === 400 &&
		error.description.includes(MESSAGE_NOT_MODIFIED)
	)
}

async function renderPage(
	api: Api,
	chatId: number,
	messageToEdit: MessageToEdit,
	page: PageContent,
): Promise<void> {
	const currentlyPhoto = messageToEdit.hasPhoto
	const targetPhoto = page.photo !== undefined

	if (currentlyPhoto === targetPhoto) {
		if (targetPhoto && page.photo !== undefined) {
			await api.editMessageMedia(
				chatId,
				messageToEdit.messageId,
				InputMediaBuilder.photo(page.photo, {
					caption: page.message,
					parse_mode: 'HTML',
				}),
				{ reply_markup: page.keyboard },
			)

			return
		}

		await api.editMessageText(
			chatId,
			messageToEdit.messageId,
			page.message,
			{
				reply_markup: page.keyboard,
				parse_mode: 'HTML',
			},
		)

		return
	}

	await api.deleteMessage(chatId, messageToEdit.messageId)

	if (targetPhoto && page.photo !== undefined) {
		await api.sendPhoto(chatId, page.photo, {
			caption: page.message,
			reply_markup: page.keyboard,
			parse_mode: 'HTML',
		})

		return
	}

	await api.sendMessage(chatId, page.message, {
		reply_markup: page.keyboard,
		parse_mode: 'HTML',
	})
}

async function executeEffect(
	effect: Effect,
	api: Api,
	chatId: number,
	messageToEdit: MessageToEdit,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	session: SessionData<any>,
): Promise<void> {
	switch (effect.type) {
		case EffectType.EDIT:
			await renderPage(api, chatId, messageToEdit, effect.page)

			session.lastPage = effect.page
			break

		case EffectType.ASK:
			await api.sendMessage(chatId, effect.prompt.message, {
				reply_markup: {
					force_reply: true,
					input_field_placeholder: effect.prompt.placeholder,
				},
				parse_mode: 'HTML',
			})
			session.lastAsk = {
				onSubmit: effect.onSubmit,
				pageToEdit: messageToEdit,
			}
			break

		case EffectType.SEND_LOADING:
			await api.editMessageText(
				chatId,
				messageToEdit.messageId,
				effect.message,
				{
					parse_mode: 'HTML',
				},
			)

			await executeEffect(
				resolveEffect(session, await effect.next()),
				api,
				chatId,
				messageToEdit,
				session,
			)
			break
	}
}

export async function executeEffectOrDisplayError(
	api: Api,
	chatId: number,
	messageToEdit: MessageToEdit,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	session: SessionData<any>,
	boundAction: BoundAction,
	rawPayload: string | undefined,
	messagesToDelete: number[] = [],
): Promise<void> {
	try {
		const payload =
			rawPayload !== undefined
				? boundAction.decode(rawPayload)
				: undefined
		const effect = await boundAction.handler(session, payload)
		await executeEffect(effect, api, chatId, messageToEdit, session)
	} catch (error) {
		if (isMessageNotModifiedError(error)) return

		if (!(error instanceof ErrorToRender)) {
			logger.error(error)
		}

		const errorPage = composePageContentWithError(
			session.lastPage ?? messageToEdit.pageContent,
			error,
		)

		fireAndForget(renderPage(api, chatId, messageToEdit, errorPage))
	} finally {
		if (messagesToDelete.length !== 0) {
			fireAndForget(api.deleteMessages(chatId, messagesToDelete))
		}
	}
}
