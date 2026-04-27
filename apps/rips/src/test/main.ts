import { autoRetry } from '@grammyjs/auto-retry'
import { run } from '@grammyjs/runner'
import { Bot, session } from 'grammy'
import { getEnvSafe } from '../utils/common'
import { handleTestButton } from './button-handler'
import { handleTestMessage } from './message-handler'
import { TestHomePage } from './pages/test-home-page'
import { Context, SessionData } from './types'

const bot = new Bot<Context>(getEnvSafe('BOT_TOKEN'))

bot.api.config.use(autoRetry())

function initial(): SessionData {
	return { lastAsk: null, flow: null }
}

bot.use(session({ initial }))

bot.command('start', async (ctx) => {
	const page = TestHomePage.render()

	await ctx.reply(page.message, {
		reply_markup: page.keyboard,
		parse_mode: 'HTML',
	})
})

bot.on('callback_query:data', async (ctx) => handleTestButton(ctx))

bot.on('message:text', async (ctx) => handleTestMessage(ctx, bot))

void bot.api.setMyCommands([{ command: 'start', description: 'Start' }])

run(bot)
