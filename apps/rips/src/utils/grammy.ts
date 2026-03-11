import { Filter, InlineKeyboard } from 'grammy'
import { Context, PageContent } from '../types'

export function getCurrentPage(
	ctx: Filter<Context, 'callback_query:data'>,
): PageContent {
	const rawMarkup = ctx.callbackQuery.message?.reply_markup

	const keyboard =
		rawMarkup && 'inline_keyboard' in rawMarkup
			? InlineKeyboard.from(rawMarkup.inline_keyboard)
			: new InlineKeyboard()

	const message = ctx.callbackQuery.message?.text || ''

	return { message, keyboard }
}
