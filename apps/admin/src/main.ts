import { autoRetry } from '@grammyjs/auto-retry'
import { run } from '@grammyjs/runner'
import { Bot, InlineKeyboard, session } from 'grammy'
import { client } from '../generated/api-client/client.gen'
import { openHome } from './action-handlers/open-home'
import { handleButton } from './button-handler'
import { logger } from './logging/pino-logger'
import { handleMessage } from './message-handler'
import { startMetricsServer } from './metrics/server'
import { createTelegramMetricsTransformer } from './metrics/telegram'
import { Context, PageContent, SessionData } from './types'
import { ApiError } from './utils/api-error'
import { getEnvSafe } from './utils/common'

client.setConfig({
	baseUrl: getEnvSafe('BACKEND_URL'),
	kyOptions: { throwHttpErrors: false },
})

client.interceptors.error.use((error, response) => {
	return new ApiError(response.status, error)
})

startMetricsServer()

const bot = new Bot<Context>(getEnvSafe('BOT_TOKEN'))

bot.api.config.use(autoRetry())
bot.api.config.use(createTelegramMetricsTransformer())

const IGNORE_OLD_THRESHOLD_SECONDS = 1
const botStartTime = Math.floor(Date.now() / 1000)

bot.use((ctx, next) => {
	const date = ctx.message?.date ?? ctx.callbackQuery?.message?.date

	if (date === undefined) return next()

	if (botStartTime - date > IGNORE_OLD_THRESHOLD_SECONDS) return

	return next()
})

function initial(): SessionData {
	return { telegramId: '', lastAsk: null, flow: null }
}

bot.use(session({ initial }))

bot.use((ctx, next) => {
	if (ctx.from !== undefined) {
		ctx.session.telegramId = String(ctx.from.id)
	}
	return next()
})

bot.command('start', async (ctx) => {
	let pageContent: PageContent = {
		keyboard: new InlineKeyboard(),
		message: 'Failed to get or create user',
	}

	try {
		const showHomeEffect = await openHome(ctx.session, undefined)
		pageContent = showHomeEffect.page
	} catch (error) {
		logger.error(error, 'Error in /start command')
	}

	await ctx.reply(pageContent.message, {
		reply_markup: pageContent.keyboard,
		parse_mode: 'HTML',
	})
})

bot.on('callback_query:data', async (ctx) => handleButton(ctx))

bot.on('message:text', async (ctx) => handleMessage(ctx, bot))

void bot.api.setMyCommands([{ command: 'start', description: 'Start the bot' }])

run(bot)
