import { FormattedString } from '@grammyjs/parse-mode'
import { Message as TelegramMessage, User } from '@grammyjs/types'
import {
	Filter,
	Context as GrammyContext,
	GrammyError,
	InlineKeyboard,
	SessionFlavor,
} from 'grammy'
import { COMMAND_SEPARATOR } from '../action/action-data'
import { BoundAction } from '../action/actions'
import { executeEffectOrDisplayError } from '../effects/effect-executor'
import { logger } from '../logging/pino-logger'
import { FlowBase } from '../session/session-utils'
import { Message, PageContent, SessionData } from '../types'
import { fireAndForget } from '../utils/common'

type BaseContext = GrammyContext &
	SessionFlavor<SessionData<FlowBase | null>> & { from: User }

type ButtonContext = Filter<BaseContext, 'callback_query:data'>

const processingUsers = new Set<number>()

export function createButtonHandler(
	actions: Record<string, BoundAction | undefined>,
): (ctx: ButtonContext) => Promise<void> {
	return async function handleButton(ctx: ButtonContext): Promise<void> {
		const userId = ctx.from.id

		if (processingUsers.has(userId)) return
		processingUsers.add(userId)

		try {
			fireAndForget(ctx.answerCallbackQuery())

			const lastAsk = ctx.session.lastAsk
			const messagesToDelete =
				lastAsk === null ? [] : [lastAsk.promptMessageId]

			ctx.session.lastAsk = null

			const message = ctx.callbackQuery.message

			if (message === undefined)
				throw new Error('No message id on callback query')

			const resolved = resolveAction(ctx, actions)

			if (resolved === null) return

			await executeEffectOrDisplayError(
				ctx.api,
				toMessage(message),
				ctx.session,
				resolved.action,
				resolved.payload,
				recoverPage(message),
				messagesToDelete,
			)
		} catch (error) {
			if (error instanceof GrammyError) throw error
			logger.error(error)
		} finally {
			processingUsers.delete(userId)
		}
	}
}

interface ActionCall {
	actionId: string
	payload: string | undefined
}

function parseActionData(data: string): ActionCall {
	const separatorIndex = data.indexOf(COMMAND_SEPARATOR)

	if (separatorIndex === -1) return { actionId: data, payload: undefined }

	return {
		actionId: data.slice(0, separatorIndex),
		payload: data.slice(separatorIndex + 1),
	}
}

function resolveAction(
	ctx: ButtonContext,
	actions: Record<string, BoundAction | undefined>,
): (ActionCall & { action: BoundAction }) | null {
	const { actionId, payload } = parseActionData(ctx.callbackQuery.data)

	if (actionId === '') {
		logger.error('Missing action ID in callback data')
		return null
	}

	const action = actions[actionId]

	if (action === undefined) {
		logger.error({ actionId }, 'Unknown action')
		return null
	}

	return { action, actionId, payload }
}

function toMessage(message: TelegramMessage): Message {
	return {
		chatId: message.chat.id,
		messageId: message.message_id,
		hasPhoto: hasPhoto(message),
	}
}

function recoverPage(message: TelegramMessage): PageContent {
	const withPhoto = hasPhoto(message)
	const text = (withPhoto ? message.caption : message.text) ?? ''
	const entities =
		(withPhoto ? message.caption_entities : message.entities) ?? []

	const rawMarkup = message.reply_markup
	const keyboard =
		rawMarkup && 'inline_keyboard' in rawMarkup
			? InlineKeyboard.from(rawMarkup.inline_keyboard)
			: new InlineKeyboard()

	return { message: new FormattedString(text, entities), keyboard }
}

function hasPhoto(message: TelegramMessage): boolean {
	return message.photo !== undefined
}
