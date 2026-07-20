import { User } from '@grammyjs/types'
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
import { MessageToEdit, SessionData } from '../types'
import { fireAndForget } from '../utils/common'

type BaseContext = GrammyContext &
	SessionFlavor<SessionData<FlowBase | null>> & { from: User }

const processingUsers = new Set<number>()

export function createButtonHandler(
	actions: Record<string, BoundAction | undefined>,
): (ctx: Filter<BaseContext, 'callback_query:data'>) => Promise<void> {
	return async function handleButton(
		ctx: Filter<BaseContext, 'callback_query:data'>,
	): Promise<void> {
		const userId = ctx.from.id

		if (processingUsers.has(userId)) return
		processingUsers.add(userId)

		try {
			fireAndForget(ctx.answerCallbackQuery())

			ctx.session.lastAsk = null

			const [actionId, payload] =
				ctx.callbackQuery.data.split(COMMAND_SEPARATOR)
			const { chatId, page } = getChatIdAndPage(ctx)

			if (actionId === undefined) {
				logger.error('Missing action ID in callback data')
				return
			}

			const boundAction = actions[actionId]

			if (boundAction === undefined) {
				logger.error({ actionId }, 'Unknown action')
				return
			}

			await executeEffectOrDisplayError(
				ctx.api,
				chatId,
				page,
				ctx.session,
				boundAction,
				payload,
			)
		} catch (error) {
			if (error instanceof GrammyError) throw error
			logger.error(error)
		} finally {
			processingUsers.delete(userId)
		}
	}
}

function getChatIdAndPage(ctx: Filter<BaseContext, 'callback_query:data'>): {
	page: MessageToEdit
	chatId: number
} {
	const rawMarkup = ctx.callbackQuery.message?.reply_markup

	const keyboard =
		rawMarkup && 'inline_keyboard' in rawMarkup
			? InlineKeyboard.from(rawMarkup.inline_keyboard)
			: new InlineKeyboard()

	const message = ctx.callbackQuery.message

	if (message === undefined)
		throw new Error('No message id on callback query')

	const hasPhoto = message.photo !== undefined
	const text = (hasPhoto ? message.caption : message.text) ?? ''
	const messageId = message.message_id

	return {
		page: { pageContent: { message: text, keyboard }, messageId, hasPhoto },
		chatId: message.chat.id,
	}
}
