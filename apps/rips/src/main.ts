import { autoRetry } from '@grammyjs/auto-retry'
import { run } from '@grammyjs/runner'
import { Bot, InlineKeyboard, session } from 'grammy'
import { handleButton } from './button-handler/button-hanlder'
import { enterHomeFlow } from './flows/home'
import { handleMessage } from './message-hanlder'
import { Context, PageContent, SessionData } from './types'
import { getEnvSafe } from './utils/common'

const bot = new Bot<Context>(getEnvSafe('BOT_TOKEN'))

bot.api.config.use(autoRetry())

const IGNORE_OLD_THRESHOLD_SECONDS = 1
const botStartTime = Math.floor(Date.now() / 1000)

bot.use((ctx, next) => {
	const date = ctx.message?.date ?? ctx.callbackQuery?.message?.date

	if (date === undefined) return next()

	if (botStartTime - date > IGNORE_OLD_THRESHOLD_SECONDS) return

	return next()
})

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
	console.log('start')
	let pageContent: PageContent = {
		keyboard: new InlineKeyboard(),
		message: 'Failed to get or create user',
	}

	try {
		pageContent = await enterHomeFlow(ctx)
	} catch (error) {
		console.log(error)
	}

	await ctx.reply(pageContent.message, {
		reply_markup: pageContent.keyboard,
	})
})

bot.on('callback_query:data', async (ctx) => await handleButton(ctx))

bot.on('message:text', async (ctx) => await handleMessage(ctx, bot))

void bot.api.setMyCommands([{ command: 'start', description: 'Start the bot' }])

run(bot)
