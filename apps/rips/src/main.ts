import { autoRetry } from '@grammyjs/auto-retry'
import { run } from '@grammyjs/runner'
import { Bot } from 'grammy'
import { homePageInstance } from './pages/home/home-page'
import { Page } from './pages/page'
import { pages } from './pages/registry'
import { getEnvSafe } from './utils/common'

const bot = new Bot(getEnvSafe('BOT_TOKEN'))

bot.api.config.use(autoRetry())

bot.api.config.use((prev, method, payload, signal) => {
	console.log(`API call: ${method}`, payload)
	return prev(method, payload, signal)
})

bot.use((ctx, next) => {
	console.log('Update received:', JSON.stringify(ctx.update, null, 2))
	return next()
})

bot.command('start', async (ctx) => {
	await ctx.reply(homePageInstance.message(), {
		reply_markup: homePageInstance.keyboard(),
	})
})

export const pageRegisty: { [id: string]: Page } = {}

pages.forEach((page) => {
	pageRegisty[page.id] = page
	if (page.hasNavigation && page.id !== homePageInstance.id) {
		page.setHomePage(homePageInstance)
	}
})

bot.on('callback_query:data', async (ctx) => {
	void ctx.answerCallbackQuery()
	console.log('user press button, data:', ctx.callbackQuery.data)

	const data = ctx.callbackQuery.data

	const pageId = data.split(':')[0]

	const page = pageRegisty[pageId]

	await page.navigate(ctx)
})

void bot.api.setMyCommands([{ command: 'start', description: 'Start the bot' }])

run(bot)
