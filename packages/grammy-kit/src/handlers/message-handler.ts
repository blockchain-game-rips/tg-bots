import { User } from '@grammyjs/types'
import { Api, Filter, Context as GrammyContext, SessionFlavor } from 'grammy'
import { BoundAction } from '../action/actions'
import { executeEffectOrDisplayError } from '../effects/effect-executor'
import { FlowBase } from '../session/session-utils'
import { findWorkspaceByPrompt } from '../session/workspaces'
import { ActionId, Message, SessionData, Workspace } from '../types'
import { EMPTY_PAGE } from './empty-page'

type BaseContext = GrammyContext & SessionFlavor<SessionData> & { from: User }

/**
 * A prompt is answered by typing or by uploading a file, so the handler accepts
 * both. A document is serialised into the same string the payload contract
 * already carries, leaving fetching the bytes to the action that asked.
 *
 * A union of the two filters rather than a filter over a union query: the
 * latter also asserts the two are mutually exclusive, which would reject a
 * caller still listening for text alone.
 */
type SubmitContext =
	| Filter<BaseContext, 'message:text'>
	| Filter<BaseContext, 'message:document'>

/**
 * A document carries its name alongside its id so a confirmation screen can
 * say which file was attached. Both travel inside the existing string payload
 * rather than widening the contract every text prompt also depends on.
 */
export interface DocumentPayload {
	fileId: string
	fileName: string | null
}

const DOCUMENT_PAYLOAD_TAG = 'document'

interface TaggedDocumentPayload {
	tag: typeof DOCUMENT_PAYLOAD_TAG
	fileId: string
	fileName: string | null
}

function isTaggedDocumentPayload(
	value: unknown,
): value is TaggedDocumentPayload {
	if (typeof value !== 'object' || value === null) return false

	if (!('tag' in value) || value.tag !== DOCUMENT_PAYLOAD_TAG) return false

	if (!('fileId' in value) || typeof value.fileId !== 'string') return false

	if (!('fileName' in value)) return false

	return typeof value.fileName === 'string' || value.fileName === null
}

function encodeDocumentPayload(document: {
	file_id: string
	file_name?: string
}): string {
	const payload: TaggedDocumentPayload = {
		tag: DOCUMENT_PAYLOAD_TAG,
		fileId: document.file_id,
		fileName: document.file_name ?? null,
	}

	return JSON.stringify(payload)
}

/**
 * Returns null for anything that is not an encoded document, so a typed reply
 * to a prompt expecting a file is reported rather than mistaken for one.
 */
export function parseDocumentPayload(raw: unknown): DocumentPayload | null {
	if (typeof raw !== 'string') return null

	let parsed: unknown

	try {
		parsed = JSON.parse(raw)
	} catch {
		return null
	}

	if (!isTaggedDocumentPayload(parsed)) return null

	return { fileId: parsed.fileId, fileName: parsed.fileName }
}

export function createMessageHandler(
	actions: Record<string, BoundAction | undefined>,
): (ctx: SubmitContext, bot: { api: Api }) => Promise<void> {
	return async function handleMessage(
		ctx: SubmitContext,
		bot: { api: Api },
	): Promise<void> {
		const askAndSubmit = getAskAndSubmit(ctx)
		if (askAndSubmit === null) return

		const { workspace, ask, submit } = askAndSubmit
		const messagesToDelete = [ask.messageId, submit.messageId]

		await executeEffectOrDisplayError({
			api: bot.api,
			chatId: ctx.chat.id,
			telegramId: ctx.from.id,
			message: ask.message,
			workspace,
			actions,
			action: { actionId: ask.onSubmit, payload: submit.message },
			fallbackPage: EMPTY_PAGE,
			messagesToDelete,
		})
	}
}

function getSubmittedContent(ctx: SubmitContext): string | null {
	const { text, document } = ctx.message

	if (text !== undefined) return text

	if (document !== undefined) return encodeDocumentPayload(document)

	return null
}

function getAskAndSubmit(ctx: SubmitContext): {
	workspace: Workspace<FlowBase | null>
	ask: {
		messageId: number
		onSubmit: ActionId<unknown>
		message: Message | null
	}
	submit: {
		message: string
		messageId: number
	}
} | null {
	const content = getSubmittedContent(ctx)

	if (content === null) return null

	const repliedTo = ctx.message.reply_to_message

	if (!repliedTo || repliedTo.from?.id !== ctx.me.id) return null

	const workspace = findWorkspaceByPrompt(ctx.session, repliedTo.message_id)

	if (workspace === null) return null

	const { lastAsk } = workspace

	if (lastAsk === null) return null

	return {
		workspace,
		ask: {
			messageId: repliedTo.message_id,
			onSubmit: lastAsk.onSubmit,
			message: lastAsk.message,
		},
		submit: {
			message: content,
			messageId: ctx.message.message_id,
		},
	}
}
