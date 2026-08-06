import { Api, GrammyError, InlineKeyboard } from 'grammy'
import { resolveEffect } from '../action/action-def'
import { BoundAction } from '../action/actions'
import { logger } from '../logging/pino-logger'
import { replacePage } from '../messaging/page-delivery'
import { sendPrompt } from '../messaging/prompt-delivery'
import { Effect, EffectType, Message, PageContent, SessionData } from '../types'
import { fireAndForget } from '../utils/common'
import {
	composePageContentWithError,
	ErrorToRender,
	generateErrorId,
} from './error-to-render'

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
	messageToEdit: Message,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	session: SessionData<any>,
): Promise<void> {
	switch (effect.type) {
		case EffectType.EDIT:
			await replacePage(api, messageToEdit, effect.page)

			session.lastPage = effect.page
			break

		case EffectType.ASK:
			const promptMessageId = await sendPrompt(
				api,
				messageToEdit.chatId,
				effect.prompt,
			)

			session.lastAsk = {
				onSubmit: effect.onSubmit,
				messageToEdit,
				promptMessageId,
			}
			break

		case EffectType.SEND_LOADING: {
			const loadingMessage = await replacePage(api, messageToEdit, {
				message: effect.message,
				keyboard: new InlineKeyboard(),
			})

			await executeEffect(
				resolveEffect(session, await effect.next()),
				api,
				loadingMessage,
				session,
			)
			break
		}
	}
}

export async function executeEffectOrDisplayError(
	api: Api,
	messageToEdit: Message,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	session: SessionData<any>,
	boundAction: BoundAction,
	rawPayload: string | undefined,
	fallbackPage: PageContent,
	messagesToDelete: number[] = [],
): Promise<void> {
	try {
		const payload =
			rawPayload !== undefined
				? boundAction.decode(rawPayload)
				: undefined
		const effect = await boundAction.handler(session, payload)
		await executeEffect(effect, api, messageToEdit, session)
	} catch (error) {
		if (isMessageNotModifiedError(error)) return

		const isUnexpected = !(error instanceof ErrorToRender)
		const errorId = isUnexpected ? generateErrorId() : undefined

		if (isUnexpected) {
			logger.error({ err: error, errorId })
		}

		const errorPage = composePageContentWithError(
			session.lastPage ?? fallbackPage,
			error,
			errorId,
		)

		fireAndForget(replacePage(api, messageToEdit, errorPage))
	} finally {
		if (messagesToDelete.length !== 0) {
			fireAndForget(
				api.deleteMessages(messageToEdit.chatId, messagesToDelete),
			)
		}
	}
}
