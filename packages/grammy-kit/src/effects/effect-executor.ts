import { Api, GrammyError, InlineKeyboard } from 'grammy'
import { resolveEffect } from '../action/action-def'
import { BoundAction } from '../action/actions'
import { logger } from '../logging/pino-logger'
import { replacePage } from '../messaging/page-delivery'
import { sendPrompt } from '../messaging/prompt-delivery'
import { BACK_ACTION_ID } from '../action/action-data'
import { previousEntry, recordPage } from '../session/history'
import {
	ActionData,
	Effect,
	EffectType,
	HistoryEntry,
	Message,
	PageContent,
	SessionData,
} from '../types'
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
	session: SessionData,
	action: ActionData,
): Promise<void> {
	switch (effect.type) {
		case EffectType.EDIT:
			await replacePage(api, messageToEdit, effect.page)

			recordPage(session, action, effect)
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
				action,
			)
			break
		}
	}
}

async function resolveEffectToExecute(
	session: SessionData,
	actions: Record<string, BoundAction | undefined>,
	action: ActionData,
): Promise<Effect | null> {
	const target = resolveTarget(session, action)

	if (target === null) return null

	if (target.kind === 'page') {
		return { type: EffectType.EDIT, page: target.page }
	}

	const boundAction = actions[target.action.actionId]

	if (boundAction === undefined) {
		logger.error({ actionId: target.action.actionId }, 'Unknown action')

		return null
	}

	const { payload } = target.action

	return await boundAction.handler(
		session,
		payload !== undefined ? boundAction.decode(payload) : undefined,
	)
}

function resolveTarget(
	session: SessionData,
	action: ActionData,
): HistoryEntry | null {
	if (action.actionId !== BACK_ACTION_ID) return { kind: 'action', action }

	return previousEntry(session)
}

export async function executeEffectOrDisplayError(
	api: Api,
	messageToEdit: Message,
	session: SessionData,
	actions: Record<string, BoundAction | undefined>,
	action: ActionData,
	fallbackPage: PageContent,
	messagesToDelete: number[] = [],
): Promise<void> {
	try {
		const effect = await resolveEffectToExecute(session, actions, action)

		if (effect === null) return

		await executeEffect(effect, api, messageToEdit, session, action)
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
