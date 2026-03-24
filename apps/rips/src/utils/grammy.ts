import { Bot, Filter, InlineKeyboard } from 'grammy'
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

export async function editMessage(ctx: Context, pageContent: PageContent) {
	await ctx.editMessageText(pageContent.message, {
		reply_markup: pageContent.keyboard,
	})
}

export async function editSpecificMessage(
	bot: Bot<Context>,
	chatId: number,
	messageId: number,
	pageContent: PageContent,
) {
	await bot.api.editMessageText(chatId, messageId, pageContent.message, {
		reply_markup: pageContent.keyboard,
	})
}
