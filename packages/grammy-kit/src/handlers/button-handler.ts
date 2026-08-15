import { FormattedString } from '@grammyjs/parse-mode'
import { Message as TelegramMessage, User } from '@grammyjs/types'
import {
	Filter,
	Context as GrammyContext,
	GrammyError,
	InlineKeyboard,
	SessionFlavor,
} from 'grammy'
import { parseActionData } from '../action/action-data'
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

			const message = ctx.callbackQuery.message

			if (message === undefined)
				throw new Error('No message id on callback query')

			const action = parseActionData(ctx.callbackQuery.data)

			if (action.actionId === '') {
				logger.error('Missing action ID in callback data')
				return
			}

			await executeEffectOrDisplayError({
				api: ctx.api,
				chatId: message.chat.id,
				telegramId: ctx.from.id,
				message: toMessage(message),
				session: ctx.session,
				actions,
				action,
				fallbackPage: recoverPage(message),
				messagesToDelete,
			})
		} catch (error) {
			if (error instanceof GrammyError) throw error
			logger.error(error)
		} finally {
			processingUsers.delete(userId)
		}
	}
}

function toMessage(message: TelegramMessage): Message {
	return {
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
