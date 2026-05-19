import { autoRetry } from '@grammyjs/auto-retry'
import { run } from '@grammyjs/runner'
import { ApiError, client } from '@rips/api-client'
import {
	createButtonHandler,
	createMessageHandler,
	createTelegramMetricsTransformer,
	logger,
	startMetricsServer,
} from '@rips/grammy-kit'
import { Bot, InlineKeyboard, session } from 'grammy'
import { actionIds, actions } from './actions'
import { Flow } from './flows'
import { Context, PageContent, SessionData } from './types'
import { getAllowedUserIds, getEnvSafe } from './utils/common'

client.setConfig({
	baseUrl: getEnvSafe('BACKEND_URL'),
	kyOptions: { throwHttpErrors: false },
})

client.interceptors.error.use((error, response) => {
	return new ApiError(response.status, error)
})

startMetricsServer()

const bot = new Bot<Context>(getEnvSafe('BOT_TOKEN'))

bot.use((ctx, next) => {
	if (ctx.chat?.type !== 'private') return
	return next()
})

bot.api.config.use(autoRetry())
bot.api.config.use(createTelegramMetricsTransformer())

const IGNORE_OLD_THRESHOLD_SECONDS = 1
const botStartTime = Math.floor(Date.now() / 1000)

const allowedUserIds = getAllowedUserIds()

bot.use((ctx, next) => {
	const userId = ctx.from?.id

	if (userId === undefined || !allowedUserIds.has(userId)) return

	return next()
})

bot.use((ctx, next) => {
	const date = ctx.message?.date ?? ctx.callbackQuery?.message?.date

	if (date === undefined) return next()

	if (botStartTime - date > IGNORE_OLD_THRESHOLD_SECONDS) return

	return next()
})

function initial(): SessionData<Flow> {
	return { telegramId: '', lastAsk: null, flow: null, lastPage: null }
}

bot.use(session({ initial }))

bot.use((ctx, next) => {
	if (ctx.from !== undefined) {
		ctx.session.telegramId = String(ctx.from.id)
	}
	return next()
})

const handleButton = createButtonHandler(actions)
const handleMessage = createMessageHandler(actions)

bot.command('start', async (ctx) => {
	let pageContent: PageContent = {
		keyboard: new InlineKeyboard(),
		message: 'Failed to load home',
	}

	try {
		const homeAction = actions[actionIds.openHome]

		if (homeAction === undefined)
			throw new Error('Home action not registered')

		const effect = await homeAction.handler(ctx.session, undefined)
		if ('page' in effect) {
			pageContent = effect.page
		}
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
