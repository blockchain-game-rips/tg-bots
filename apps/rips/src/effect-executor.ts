import { Api } from 'grammy'
import { BoundAction } from './actions'
import { Effect, EffectType, MessageToEdit, SessionData } from './types'
import { fireAndForget } from './utils/common'
import { composePageContentWithError } from './utils/error-to-render'

async function executeEffect(
	effect: Effect,
	api: Api,
	chatId: number,
	messageToEdit: MessageToEdit,
	session: SessionData,
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
				await effect.next(),
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
	session: SessionData,
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
		const errorPage = composePageContentWithError(
			messageToEdit.pageContent,
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
