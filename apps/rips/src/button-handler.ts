import { Filter, GrammyError, InlineKeyboard } from 'grammy'
import { actions, BoundAction } from './actions'
import { executeEffectOrDisplayError } from './effect-executor'
import { logger } from './logging/pino-logger'
import { Context, MessageToEdit } from './types'
import { COMMAND_SEPARATOR } from './utils/action-data'
import { fireAndForget } from './utils/common'

const processingUsers = new Set<number>()

export async function handleButton(
	ctx: Filter<Context, 'callback_query:data'>,
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

		const boundAction = (
			actions as Record<string, BoundAction | undefined>
		)[actionId]

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

function getChatIdAndPage(ctx: Filter<Context, 'callback_query:data'>): {
	page: MessageToEdit
	chatId: number
} {
	const rawMarkup = ctx.callbackQuery.message?.reply_markup

	const keyboard =
		rawMarkup && 'inline_keyboard' in rawMarkup
			? InlineKeyboard.from(rawMarkup.inline_keyboard)
			: new InlineKeyboard()

	const message = ctx.callbackQuery.message

	// unreachable when user presses button
	if (message === undefined)
		throw new Error('No message id on callback query')

	const text = message.text ?? ''
	const messageId = message.message_id

	return {
		page: { pageContent: { message: text, keyboard }, messageId },
		chatId: message.chat.id,
	}
}
