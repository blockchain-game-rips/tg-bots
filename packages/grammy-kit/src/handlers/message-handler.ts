import { FormattedString } from '@grammyjs/parse-mode'
import { User } from '@grammyjs/types'
import {
	Api,
	Filter,
	Context as GrammyContext,
	InlineKeyboard,
	SessionFlavor,
} from 'grammy'
import { BoundAction } from '../action/actions'
import { executeEffectOrDisplayError } from '../effects/effect-executor'
import { FlowBase } from '../session/session-utils'
import { ActionId, Message, PageContent, SessionData } from '../types'

const EMPTY_PAGE: PageContent = {
	message: new FormattedString('', []),
	keyboard: new InlineKeyboard(),
}

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

		await executeEffectOrDisplayError(
			bot.api,
			ask.messageToEdit,
			ctx.session,
			actions,
			{ actionId: ask.onSubmit, payload: submit.message },
			EMPTY_PAGE,
			messagesToDelete,
		)
	}
}

function getAskAndSubmit(ctx: Filter<BaseContext, 'message:text'>): {
	ask: {
		messageId: number
		onSubmit: ActionId<unknown>
		messageToEdit: Message
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
			messageToEdit: lastAsk.messageToEdit,
		},
		submit: {
			message: ctx.message.text,
			messageId: ctx.message.message_id,
		},
	}
}
