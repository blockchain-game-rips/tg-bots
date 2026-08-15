import { User } from '@grammyjs/types'
import { Api, Filter, Context as GrammyContext, SessionFlavor } from 'grammy'
import { BoundAction } from '../action/actions'
import { executeEffectOrDisplayError } from '../effects/effect-executor'
import { FlowBase } from '../session/session-utils'
import { findWorkspaceByPrompt } from '../session/workspaces'
import { ActionId, Message, SessionData, Workspace } from '../types'
import { EMPTY_PAGE } from './empty-page'

type BaseContext = GrammyContext & SessionFlavor<SessionData> & { from: User }

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

function getAskAndSubmit(ctx: Filter<BaseContext, 'message:text'>): {
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
			message: ctx.message.text,
			messageId: ctx.message.message_id,
		},
	}
}
