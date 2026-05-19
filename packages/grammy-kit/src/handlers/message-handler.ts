import { User } from '@grammyjs/types'
import { Api, Filter, Context as GrammyContext, SessionFlavor } from 'grammy'
import { BoundAction } from '../action/actions'
import { executeEffectOrDisplayError } from '../effects/effect-executor'
import { logger } from '../logging/pino-logger'
import { FlowBase } from '../session/session-utils'
import { ActionId, MessageToEdit, SessionData } from '../types'

type BaseContext = GrammyContext &
	SessionFlavor<SessionData<FlowBase | null>> & { from: User }

export function createMessageHandler(
	actions: Record<string, BoundAction | undefined>,
): (
	ctx: Filter<BaseContext, 'message:text'>,
	bot: { api: Api },
) => Promise<void> {
	return async function handleMessage(
		ctx: Filter<BaseContext, 'message:text'>,
		bot: { api: Api },
	): Promise<void> {
		const askAndSubmit = getAskAndSubmit(ctx)
		if (askAndSubmit === null) return

		const { ask, submit } = askAndSubmit
		const messagesToDelete = [ask.messageId, submit.messageId]

		ctx.session.lastAsk = null

		const boundAction = actions[ask.onSubmit]

		if (boundAction === undefined) {
			logger.error(
				{ actionId: ask.onSubmit },
				'Unknown action for onSubmit',
			)
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
}

function getAskAndSubmit(ctx: Filter<BaseContext, 'message:text'>): {
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
