import { Bot } from 'grammy'
import { Context, PageContent } from '../types'

export async function editMessage(ctx: Context, pageContent: PageContent) {
	await ctx.editMessageText(pageContent.message, {
		reply_markup: pageContent.keyboard,
		parse_mode: 'HTML',
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
		parse_mode: 'HTML',
	})
}

export function clearFlow(ctx: Context) {
	ctx.session.activeFlow = null
}
