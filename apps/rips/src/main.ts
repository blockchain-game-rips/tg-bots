import { autoRetry } from '@grammyjs/auto-retry'
import { run } from '@grammyjs/runner'
import { Bot } from 'grammy'
import { homePageInstance } from './pages/home/home-page'
import { getEnvSafe } from './utils/common'

const bot = new Bot(getEnvSafe('BOT_TOKEN'))

bot.api.config.use(autoRetry())

bot.api.config.use((prev, method, payload, signal) => {
	console.log(`API call: ${method}`, payload)
	return prev(method, payload, signal)
})

bot.use(homePageInstance.menu)

bot.command('start', async (ctx) => {
	await ctx.reply(homePageInstance.message(), {
		reply_markup: homePageInstance.menu,
	})
})

run(bot)
