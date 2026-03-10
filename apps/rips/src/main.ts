import { autoRetry } from '@grammyjs/auto-retry'
import { run } from '@grammyjs/runner'
import { Bot, session } from 'grammy'
import { parseCommand } from './commands'
import { chooseTicketAmountPageId } from './pages/choose-ticket-amount/choose-ticket-amount-page'
import { Page, Renderable, Replyable } from './pages/interfaces'
import {
	buildPageRegistry,
	buildReplyableRegistry,
	homePageId,
} from './pages/registry'
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

const pageRegisty: { [id: string]: Renderable } = buildPageRegistry()
const replyableRegistry: { [id: string]: Replyable } = buildReplyableRegistry()

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

		case 'reply': {
			const replyable = replyableRegistry[command.pageId]

			const reply = await replyable.reply({ ctx })

			await ctx.reply(reply.message, {
				reply_markup: {
					force_reply: true,
					input_field_placeholder: reply.inputPlaceHolder,
				},
			})

			break
		}
	}
})

bot.on('message:text', async (ctx) => {
	const repliedTo = ctx.message.reply_to_message

	if (!repliedTo || repliedTo.from?.id !== ctx.me.id) {
		console.log('not replyed message')
		return
	}

	switch (ctx.session.activeFlow) {
		case 'ticket-purchase': {
			if (ctx.session.step === 'waiting-for-input') {
				const messageIdToEdit = ctx.session.messageIdToEdit

				const ticketAmount = Number(ctx.update.message.text)

				if (isNaN(ticketAmount)) {
					const renderable = pageRegisty[chooseTicketAmountPageId]

					const page = await renderable.render({
						ctx,
						params: [ctx.session.stakeId],
					})

					void bot.api.editMessageText(
						ctx.chatId,
						messageIdToEdit,
						page.message + '\n\n❌ not a number',
						{ reply_markup: page.keyboard },
					)
				} else {
					ctx.session = {
						activeFlow: 'ticket-purchase',
						step: 'confirming',
						ticketAmount: ticketAmount,
						stakeId: ctx.session.stakeId,
					}

					const renderable = pageRegisty.confirm

					const page = await renderable.render({ ctx })

					void bot.api.editMessageText(
						ctx.chatId,
						messageIdToEdit,
						page.message,
						{ reply_markup: page.keyboard },
					)
				}

				void bot.api.deleteMessages(ctx.chatId, [
					repliedTo.message_id,
					ctx.update.message.message_id,
				])
			}
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
