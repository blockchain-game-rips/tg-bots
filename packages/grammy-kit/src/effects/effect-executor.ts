import { Api, GrammyError, InlineKeyboard } from 'grammy'
import { BoundAction } from '../action/actions'
import { logger } from '../logging/pino-logger'
import { replacePage, sendMessage } from '../messaging/page-delivery'
import { sendPrompt } from '../messaging/prompt-delivery'
import { recordPage } from '../session/history'
import { applyFlowTransition, FlowTransition } from '../session/session-utils'
import {
	ActionData,
	AnyHandlerResult,
	EffectLoading,
	EffectNavigate,
	EffectType,
	LastAsk,
	Message,
	PageContent,
	SessionData,
} from '../types'
import { fireAndForget } from '../utils/common'
import { resolveActionEffect } from './resolve-effect'
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

// FlowTransition is invariant in its flow type, so no single concrete argument
// accepts every app's flow. The executor never inspects the transition, it only
// forwards it to applyFlowTransition, so the wildcard costs no safety here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFlowTransition = FlowTransition<any>

type SessionChange =
	| {
			kind: 'page'
			flow: AnyFlowTransition
			action: ActionData
			effect: EffectNavigate
	  }
	| { kind: 'ask'; flow: AnyFlowTransition; lastAsk: LastAsk }
	| { kind: 'stay' }

const STAYED_PUT: SessionChange = { kind: 'stay' }

type LoadingResult = Extract<AnyHandlerResult, { effect: EffectLoading }>

function isLoading(result: AnyHandlerResult): result is LoadingResult {
	return result.effect.type === EffectType.LOADING
}

async function deliverPage(
	api: Api,
	chatId: number,
	message: Message | null,
	page: PageContent,
): Promise<Message> {
	if (message !== null) return replacePage(api, { chatId, message }, page)

	const messageId = await sendMessage(api, chatId, page)

	return { messageId, hasPhoto: page.photo !== undefined }
}

async function performEffect(
	api: Api,
	chatId: number,
	message: Message | null,
	initialResult: AnyHandlerResult,
	action: ActionData,
): Promise<SessionChange> {
	let result = initialResult

	while (isLoading(result)) {
		message = await deliverPage(api, chatId, message, {
			message: result.effect.message,
			keyboard: new InlineKeyboard(),
		})

		result = await result.effect.next()
	}

	const { effect, flow } = result

	switch (effect.type) {
		case EffectType.NAVIGATE:
			message = await deliverPage(api, chatId, message, effect.page)

			return { kind: 'page', flow, action, effect }

		case EffectType.ASK: {
			const promptMessageId = await sendPrompt(api, chatId, effect.prompt)

			return {
				kind: 'ask',
				flow,
				lastAsk: {
					onSubmit: effect.onSubmit,
					message,
					promptMessageId,
				},
			}
		}
	}
}

function commitSessionChange(
	session: SessionData,
	change: SessionChange,
	actionIsSensitive: boolean,
): void {
	if (change.kind !== 'stay') applyFlowTransition(session, change.flow)

	session.lastAsk = change.kind === 'ask' ? change.lastAsk : null

	if (change.kind === 'page') {
		recordPage(session, change.action, change.effect, { actionIsSensitive })
	}
}

function resolveErrorPage(
	session: SessionData,
	error: unknown,
	fallbackPage: PageContent,
): PageContent {
	const isUnexpected = !(error instanceof ErrorToRender)
	const errorId = isUnexpected ? generateErrorId() : undefined

	if (isUnexpected) {
		logger.error({ err: error, errorId })
	}

	return composePageContentWithError(
		session.lastNavigatedPage ?? fallbackPage,
		error,
		errorId,
	)
}

export async function executeEffectOrDisplayError(
	api: Api,
	chatId: number,
	message: Message | null,
	session: SessionData,
	actions: Record<string, BoundAction | undefined>,
	action: ActionData,
	fallbackPage: PageContent,
	messagesToDelete: number[] = [],
): Promise<void> {
	try {
		const result = await resolveActionEffect(session, actions, action)

		const change = await performEffect(api, chatId, message, result, action)

		commitSessionChange(
			session,
			change,
			actions[action.actionId]?.sensitive === true,
		)
	} catch (error) {
		if (isMessageNotModifiedError(error)) return

		const errorPage = resolveErrorPage(session, error, fallbackPage)

		fireAndForget(deliverPage(api, chatId, message, errorPage))

		commitSessionChange(session, STAYED_PUT, false)
	} finally {
		if (messagesToDelete.length !== 0) {
			fireAndForget(api.deleteMessages(chatId, messagesToDelete))
		}
	}
}
