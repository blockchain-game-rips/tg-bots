import { autoRetry } from '@grammyjs/auto-retry'
import { run } from '@grammyjs/runner'
import { initApiClient } from '@rips/api-client'
import {
	createButtonHandler,
	createMessageHandler,
	createStartHandler,
	createTelegramMetricsTransformer,
	startMetricsServer,
} from '@rips/grammy-kit'
import { getEnvSafe } from '@rips/shared'
import { Bot, session } from 'grammy'
import { actionIds, actions } from './actions'
import { Flow } from './flows'
import { Context, SessionData } from './types'
import { getAllowedUserIds } from './utils/common'

initApiClient(getEnvSafe('BACKEND_URL'))

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
	const userId = ctx.from.id

	if (!allowedUserIds.has(userId)) return

	return next()
})

bot.use((ctx, next) => {
	const date = ctx.message?.date ?? ctx.callbackQuery?.message?.date

	if (date === undefined) return next()

	if (botStartTime - date > IGNORE_OLD_THRESHOLD_SECONDS) return

	return next()
})

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

run(bot)
