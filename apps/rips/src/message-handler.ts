import { Bot, Filter } from 'grammy'
import { actions, BoundAction } from './actions'
import { executeEffectOrDisplayError } from './effect-executor'
import { logger } from './logging/pino-logger'
import { ActionId, Context, MessageToEdit } from './types'

export async function handleMessage(
	ctx: Filter<Context, 'message:text'>,
	bot: Bot<Context>,
): Promise<void> {
	const askAndSubmit = getAskAndSubmit(ctx)
	if (askAndSubmit === null) return

	const { ask, submit } = askAndSubmit
	const messagesToDelete = [ask.messageId, submit.messageId]

	ctx.session.lastAsk = null

	const boundAction = (actions as Record<string, BoundAction | undefined>)[
		ask.onSubmit
	]

	if (boundAction === undefined) {
		logger.error({ actionId: ask.onSubmit }, 'Unknown action for onSubmit')
		return
	}

	await executeEffectOrDisplayError(
		bot.api,
		ctx.chatId,
		ask.pageToEdit,
		ctx.session,
		boundAction,
		submit.message,
		messagesToDelete,
	)
}

function getAskAndSubmit(ctx: Filter<Context, 'message:text'>): {
	ask: {
		messageId: number
		onSubmit: ActionId<unknown>
		pageToEdit: MessageToEdit
	}
	submit: {
		message: string
		messageId: number
	}
} | null {
	const repliedTo = ctx.message.reply_to_message

	if (!repliedTo || repliedTo.from?.id !== ctx.me.id) return null

	const { lastAsk } = ctx.session

	if (lastAsk === null) return null

	return {
		ask: {
			messageId: repliedTo.message_id,
			onSubmit: lastAsk.onSubmit,
			pageToEdit: lastAsk.pageToEdit,
		},
		submit: {
			message: ctx.message.text,
			messageId: ctx.message.message_id,
		},
	}
}
