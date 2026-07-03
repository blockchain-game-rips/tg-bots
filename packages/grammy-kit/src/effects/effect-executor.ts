import { Api, GrammyError } from 'grammy'
import { resolveEffect } from '../action/action-def'
import { BoundAction } from '../action/actions'
import { logger } from '../logging/pino-logger'
import { Effect, EffectType, MessageToEdit, SessionData } from '../types'
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
			await api.editMessageText(
				chatId,
				messageToEdit.messageId,
				effect.page.message,
				{
					reply_markup: effect.page.keyboard,
					parse_mode: 'HTML',
				},
			)
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

		fireAndForget(
			api.editMessageText(
				chatId,
				messageToEdit.messageId,
				errorPage.message,
				{
					reply_markup: errorPage.keyboard,
					parse_mode: 'HTML',
				},
			),
		)
	} finally {
		if (messagesToDelete.length !== 0) {
			fireAndForget(api.deleteMessages(chatId, messagesToDelete))
		}
	}
}
