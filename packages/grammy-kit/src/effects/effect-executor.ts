import { Api, GrammyError, InlineKeyboard } from 'grammy'
import { BoundAction } from '../action/actions'
import { logger } from '../logging/pino-logger'
import { replacePage } from '../messaging/page-delivery'
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

async function performEffect(
	api: Api,
	chatId: number,
	message: Message,
	initialResult: AnyHandlerResult,
	action: ActionData,
): Promise<SessionChange> {
	let result = initialResult

	while (isLoading(result)) {
		message = await replacePage(
			api,
			{ chatId, message },
			{
				message: result.effect.message,
				keyboard: new InlineKeyboard(),
			},
		)

		result = await result.effect.next()
	}

	const { effect, flow } = result

	switch (effect.type) {
		case EffectType.NAVIGATE:
			await replacePage(api, { chatId, message }, effect.page)

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
): void {
	if (change.kind !== 'stay') applyFlowTransition(session, change.flow)

	session.lastAsk = change.kind === 'ask' ? change.lastAsk : null

	if (change.kind === 'page') {
		recordPage(session, change.action, change.effect)
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
	message: Message,
	session: SessionData,
	actions: Record<string, BoundAction | undefined>,
	action: ActionData,
	fallbackPage: PageContent,
	messagesToDelete: number[] = [],
): Promise<void> {
	try {
		const result = await resolveActionEffect(session, actions, action)

		const change = await performEffect(api, chatId, message, result, action)

		commitSessionChange(session, change)
	} catch (error) {
		if (isMessageNotModifiedError(error)) return

		const errorPage = resolveErrorPage(session, error, fallbackPage)

		fireAndForget(replacePage(api, { chatId, message }, errorPage))

		commitSessionChange(session, STAYED_PUT)
	} finally {
		if (messagesToDelete.length !== 0) {
			fireAndForget(api.deleteMessages(chatId, messagesToDelete))
		}
	}
}
