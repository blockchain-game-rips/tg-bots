import { autoRetry } from '@grammyjs/auto-retry'
import { run } from '@grammyjs/runner'
import { initApiClient } from '@rips/api-client'
import {
	createButtonHandler,
	createMessageHandler,
	createStartHandler,
	createTelegramMetricsTransformer,
	logger,
	startMetricsServer,
} from '@rips/grammy-kit'
import { Bot, session } from 'grammy'
import { actionIds, actions } from './actions'
import { botStartLink, setBotUsername } from './bot-identity'
import { Flow } from './flows'
import { Notifier } from './notifier'
import { initSupportedCurrencies } from './supported-currencies'
import { Context, SessionData } from './types'
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

function initial(): SessionData<Flow> {
	return {
		lastAsk: null,
		flow: null,
		lastNavigatedPage: null,
		history: [],
	}
}

bot.use(session({ initial }))

const handleButton = createButtonHandler(actions)
const handleMessage = createMessageHandler(actions)
const handleStart = createStartHandler(actions, actionIds.openHome)

bot.command('start', async (ctx) => handleStart(ctx))

bot.on('callback_query:data', async (ctx) => handleButton(ctx))

bot.on('message:text', async (ctx) => handleMessage(ctx, bot))

void bot.api.setMyCommands([{ command: 'start', description: 'Start the bot' }])

const LAST_UPDATE_ONLY_OFFSET = -1

async function dropPendingUpdates() {
	const [lastUpdate] = await bot.api.getUpdates({
		offset: LAST_UPDATE_ONLY_OFFSET,
		timeout: 0,
	})

	if (lastUpdate === undefined) return

	await bot.api.getUpdates({
		offset: lastUpdate.update_id + 1,
		timeout: 0,
	})
}

async function start() {
	await initSupportedCurrencies()

	const me = await bot.api.getMe()

	setBotUsername(me.username)

	await dropPendingUpdates()

	run(bot)

	const notifier = new Notifier(bot, botStartLink())
	notifier.run()
}

start().catch((error: unknown) => {
	logger.error(error, 'Failed to start bot')
	process.exit(1)
})
