import { autoRetry } from '@grammyjs/auto-retry'
import { run } from '@grammyjs/runner'
import { initApiClient } from '@rips/api-client'
import {
	createButtonHandler,
	createMessageHandler,
	createTelegramMetricsTransformer,
	fmt,
	logger,
	startMetricsServer,
} from '@rips/grammy-kit'
import { Bot, InlineKeyboard, session } from 'grammy'
import { actions } from './actions'
import { Flow } from './flows'
import { Notifier } from './notifier'
import { Context, EffectType, PageContent, SessionData } from './types'
import { getEnvSafe } from './utils/common'
import { installKeyboardExtensions } from './utils/keyboard'

initApiClient(getEnvSafe('BACKEND_URL'))

startMetricsServer()

installKeyboardExtensions()

const bot = new Bot<Context>(getEnvSafe('BOT_TOKEN'))

bot.use((ctx, next) => {
	if (ctx.chat?.type !== 'private') return
	return next()
})

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

function initial(): SessionData<Flow> {
	return { telegramId: '', lastAsk: null, flow: null, lastPage: null }
}

bot.use(session({ initial }))

bot.use((ctx, next) => {
	const from = ctx.from

	ctx.session.telegramId = String(from.id)

	return next()
})

const handleButton = createButtonHandler(actions)
const handleMessage = createMessageHandler(actions)

bot.command('start', async (ctx) => {
	let pageContent: PageContent = {
		keyboard: new InlineKeyboard(),
		message: fmt`Failed to get or create user`,
	}

	try {
		const homeAction = actions['0']

		if (homeAction === undefined)
			throw new Error('Home action not registered')

		const showHomeEffect = await homeAction.handler(ctx.session, undefined)
		if (showHomeEffect.type === EffectType.EDIT) {
			pageContent = showHomeEffect.page
		}
	} catch (error) {
		logger.error(error, 'Error in /start command')
	}

	await ctx.reply(pageContent.message.text, {
		reply_markup: pageContent.keyboard,
		entities: pageContent.message.entities,
	})
})

bot.on('callback_query:data', async (ctx) => handleButton(ctx))

bot.on('message:text', async (ctx) => handleMessage(ctx, bot))

void bot.api.setMyCommands([{ command: 'start', description: 'Start the bot' }])

run(bot)

const notifier = new Notifier(bot)
notifier.run()
