import { autoRetry } from '@grammyjs/auto-retry'
import { run } from '@grammyjs/runner'
import { Bot, InlineKeyboard, session } from 'grammy'
import { client } from '../generated/api-client/client.gen'
import { actionIds } from './actions'
import { actions } from './actions'
import { handleButton } from './button-handler'
import { executeEffectOrDisplayError } from './effect-executor'
import { handleMessage } from './message-handler'
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

	const fakeMessageToEdit = {
		pageContent,
		messageId: -1,
	}

	const sentMessage = await ctx.reply('Loading...', { parse_mode: 'HTML' })

	fakeMessageToEdit.messageId = sentMessage.message_id
	fakeMessageToEdit.pageContent = {
		message: 'Loading...',
		keyboard: new InlineKeyboard(),
	}

	await executeEffectOrDisplayError(
		bot.api,
		ctx.chatId,
		fakeMessageToEdit,
		ctx.session,
		() => actions[actionIds.showHome](ctx.session, undefined),
	)
})

bot.on('callback_query:data', async (ctx) => handleButton(ctx))

bot.on('message:text', async (ctx) => handleMessage(ctx, bot))

void bot.api.setMyCommands([{ command: 'start', description: 'Start the bot' }])

run(bot)
