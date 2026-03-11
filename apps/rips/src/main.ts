import { autoRetry } from '@grammyjs/auto-retry'
import { run } from '@grammyjs/runner'
import { Bot, session } from 'grammy'
import { handleButton } from './button-hanlder'
import { handleMessage } from './message-hanlder'
import { HomePage } from './pages/home/home-page'
import { Context, SessionData } from './types'
import { getEnvSafe } from './utils/common'

const bot = new Bot<Context>(getEnvSafe('BOT_TOKEN'))

bot.api.config.use(autoRetry())

bot.api.config.use((prev, method, payload, signal) => {
	console.log(`API call: ${method}`, payload)
	return prev(method, payload, signal)
})

bot.use((ctx, next) => {
	console.log('Update received:', JSON.stringify(ctx.update, null, 2))
	return next()
})

function initial(): SessionData {
	return { activeFlow: null }
}
bot.use(session({ initial }))

bot.command('start', async (ctx) => {
	const page = HomePage.render()

	await ctx.reply(page.message, {
		reply_markup: page.keyboard,
	})
})

bot.on('callback_query:data', async (ctx) => await handleButton(ctx))

bot.on('message:text', async (ctx) => await handleMessage(ctx, bot))

void bot.api.setMyCommands([{ command: 'start', description: 'Start the bot' }])

run(bot)
