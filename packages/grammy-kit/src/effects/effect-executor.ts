import { Api, GrammyError, InlineKeyboard } from 'grammy'
import { BoundAction } from '../action/actions'
import { logger } from '../logging/pino-logger'
import { replacePage, sendMessage } from '../messaging/page-delivery'
import { sendPrompt } from '../messaging/prompt-delivery'
import { recordPage } from '../session/history'
import { applyFlowTransition, FlowTransition } from '../session/session-utils'
import { claimMessage } from '../session/workspaces'
import {
	ActionData,
	AnyHandlerResult,
	EffectLoading,
	EffectNavigate,
	EffectType,
	LastAsk,
	Message,
	PageContent,
	Workspace,
} from '../types'
import { fireAndForget, wait } from '../utils/common'
import { resolveActionEffect } from './resolve-effect'
import {
	composePageContentWithError,
	ErrorPageToRender,
	ErrorToRender,
	generateErrorId,
} from './error-to-render'

const MESSAGE_NOT_MODIFIED = 'message is not modified'

/**
 * A floor, not a duration: work that outlasts it is unaffected, so frames with
 * their own pacing keep it. It exists so a frame wrapping fast work is still
 * read rather than flickering past.
 */
const MIN_LOADING_FRAME_MS = 500

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
			message: Message
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

	return { messageId, hasMedia: page.media !== undefined }
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

		const [next] = await Promise.all([
			result.effect.next(),
			wait(MIN_LOADING_FRAME_MS),
		])

		result = next
	}

	const { effect, flow } = result

	switch (effect.type) {
		case EffectType.NAVIGATE:
			message = await deliverPage(api, chatId, message, effect.page)

			return { kind: 'page', flow, action, effect, message }

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
	workspace: Workspace,
	change: SessionChange,
): void {
	if (change.kind !== 'stay') applyFlowTransition(workspace, change.flow)

	workspace.lastAsk = change.kind === 'ask' ? change.lastAsk : null

	if (change.kind === 'page') {
		claimMessage(workspace, change.message.messageId)
		recordPage(workspace, change.action, change.effect)
	}
}

function resolveErrorPage(
	workspace: Workspace,
	error: unknown,
	fallbackPage: PageContent,
): PageContent {
	const isUnexpected = !(error instanceof ErrorToRender)
	const errorId = isUnexpected ? generateErrorId() : undefined

	if (isUnexpected) {
		logger.error({ err: error, errorId })
	}

	return composePageContentWithError(
		resolveBasePage(workspace, error, fallbackPage),
		error,
		errorId,
	)
}

function resolveBasePage(
	workspace: Workspace,
	error: unknown,
	fallbackPage: PageContent,
): PageContent {
	if (error instanceof ErrorPageToRender) return error.pageToRender

	return workspace.lastNavigatedPage ?? fallbackPage
}

export interface EffectRequest {
	api: Api
	chatId: number
	telegramId: number
	/** the message the page replaces, or null to send a new one */
	message: Message | null
	workspace: Workspace
	actions: Record<string, BoundAction | undefined>
	action: ActionData
	/** the page an error is shown on when the workspace has no page on screen */
	fallbackPage: PageContent
	messagesToDelete?: number[]
}

export async function executeEffectOrDisplayError({
	api,
	chatId,
	telegramId,
	message,
	workspace,
	actions,
	action,
	fallbackPage,
	messagesToDelete = [],
}: EffectRequest): Promise<void> {
	try {
		const result = await resolveActionEffect(
			workspace,
			telegramId,
			actions,
			action,
		)

		const change = await performEffect(api, chatId, message, result, action)

		commitSessionChange(workspace, change)
	} catch (error) {
		if (isMessageNotModifiedError(error)) return

		const errorPage = resolveErrorPage(workspace, error, fallbackPage)

		fireAndForget(deliverPage(api, chatId, message, errorPage))

		commitSessionChange(workspace, STAYED_PUT)
	} finally {
		if (messagesToDelete.length !== 0) {
			fireAndForget(api.deleteMessages(chatId, messagesToDelete))
		}
	}
}
