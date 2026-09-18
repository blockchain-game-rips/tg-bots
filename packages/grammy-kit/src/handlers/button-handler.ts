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
import { runWithRequestContext } from '../logging/request-context'
import { resolveWorkspace } from '../session/workspaces'
import { Message, PageContent, SessionData } from '../types'
import { fireAndForget } from '../utils/common'

type BaseContext = GrammyContext & SessionFlavor<SessionData> & { from: User }

type ButtonContext = Filter<BaseContext, 'callback_query:data'>

export function createButtonHandler(
	actions: Record<string, BoundAction | undefined>,
): (ctx: ButtonContext) => Promise<void> {
	return async function handleButton(ctx: ButtonContext): Promise<void> {
		const userId = ctx.from.id

		fireAndForget(ctx.answerCallbackQuery())

		const message = ctx.callbackQuery.message

		if (message === undefined)
			throw new Error('No message id on callback query')

		const workspace = resolveWorkspace(ctx.session, message.message_id)

		// dropped rather than queued: it was aimed at a page that no longer stands
		if (workspace.isProcessing) return

		workspace.isProcessing = true

		try {
			const { lastAsk } = workspace
			const messagesToDelete =
				lastAsk === null ? [] : [lastAsk.promptMessageId]

			const action = parseActionData(ctx.callbackQuery.data)

			await runWithRequestContext(
				{ telegramId: userId, messageId: message.message_id },
				async () => {
					if (action.actionId === '') {
						logger.error('Missing action ID in callback data')
						return
					}

					logger.info(
						{ actionId: action.actionId },
						'Handling button press',
					)

					await executeEffectOrDisplayError({
						api: ctx.api,
						chatId: message.chat.id,
						telegramId: userId,
						message: toMessage(message),
						workspace,
						actions,
						action,
						fallbackPage: recoverPage(message),
						messagesToDelete,
					})
				},
			)
		} catch (error) {
			if (error instanceof GrammyError) throw error
			logger.error(error)
		} finally {
			workspace.isProcessing = false
		}
	}
}

function toMessage(message: TelegramMessage): Message {
	return {
		messageId: message.message_id,
		hasMedia: hasMedia(message),
	}
}

function recoverPage(message: TelegramMessage): PageContent {
	const withMedia = hasMedia(message)
	const text = (withMedia ? message.caption : message.text) ?? ''
	const entities =
		(withMedia ? message.caption_entities : message.entities) ?? []

	const rawMarkup = message.reply_markup
	const keyboard =
		rawMarkup && 'inline_keyboard' in rawMarkup
			? InlineKeyboard.from(rawMarkup.inline_keyboard)
			: new InlineKeyboard()

	return { message: new FormattedString(text, entities), keyboard }
}

const MEDIA_FIELDS = [
	'animation',
	'audio',
	'document',
	'live_photo',
	'paid_media',
	'photo',
	'sticker',
	'video',
	'video_note',
	'voice',
] as const satisfies readonly (keyof TelegramMessage)[]

/**
 * Whether the message holds media rather than text. Covers every kind Telegram
 * can deliver, not just the ones a page can render: a kind the bot cannot
 * reproduce still cannot be edited as text. Stickers and video notes carry no
 * caption either, so this asks what the message holds, not how it is captioned.
 */
function hasMedia(message: TelegramMessage): boolean {
	return MEDIA_FIELDS.some((field) => message[field] !== undefined)
}
