import { autoRetry } from '@grammyjs/auto-retry'
import { run } from '@grammyjs/runner'
import { Bot, Context } from 'grammy'
import { parseCommand } from './commands'
import { Page, Renderable } from './pages/interfaces'
import { buildRegistry, homePageId } from './pages/registry'
import { getEnvSafe } from './utils/common'

const bot = new Bot(getEnvSafe('BOT_TOKEN'))

bot.api.config.use(autoRetry())

bot.api.config.use((prev, method, payload, signal) => {
	console.log(`API call: ${method}`, payload)
	return prev(method, payload, signal)
})

bot.use((ctx, next) => {
	console.log('Update received:', JSON.stringify(ctx.update, null, 2))
	return next()
})

const pageRegisty: { [id: string]: Renderable } = buildRegistry()

bot.command('start', async (ctx) => {
	const homeRenderable = pageRegisty[homePageId]
	const page = await homeRenderable.render({ ctx })

	await ctx.reply(page.message, {
		reply_markup: page.keyboard,
	})
})

bot.on('callback_query:data', async (ctx) => {
	void ctx.answerCallbackQuery()

	console.log('user press button, data:', ctx.callbackQuery.data)

	const command = parseCommand(ctx.callbackQuery.data)

	switch (command.type) {
		case 'open': {
			const renderable = pageRegisty[command.pageId]

			const page = await renderable.render({
				ctx,
				params: command.payloads,
			})

			await open(ctx, page)

			break
		}
	}
})

async function open(ctx: Context, page: Page) {
	await ctx.editMessageText(page.message, {
		reply_markup: page.keyboard,
	})
}

void bot.api.setMyCommands([{ command: 'start', description: 'Start the bot' }])

run(bot)
