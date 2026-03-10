import { autoRetry } from '@grammyjs/auto-retry'
import { run } from '@grammyjs/runner'
import { Bot, session } from 'grammy'
import { parseCommand } from './commands'
import { Page, PageContent, Prompt } from './pages/interfaces'
import { pageIds } from './pages/page-ids'
import { buildPageRegistry, buildPromptRegistry } from './pages/registry'
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

const pageRegistry: { [id: string]: Page } = buildPageRegistry()
const promptRegistry: { [id: string]: Prompt } = buildPromptRegistry()

bot.command('start', async (ctx) => {
	const homePage = pageRegistry[pageIds.home]
	const page = await homePage.render({ ctx })

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
			const page = pageRegistry[command.pageId]

			const pageContent = await page.render({
				ctx,
				params: command.payloads,
			})

			await open(ctx, pageContent)

			break
		}

		case 'reply': {
			const prompt = promptRegistry[command.pageId]

			const promptContent = await prompt.render({ ctx })

			await ctx.reply(promptContent.message, {
				reply_markup: {
					force_reply: true,
					input_field_placeholder: promptContent.placeholder,
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
					const page = pageRegistry[pageIds.chooseTicketAmount]

					const pageContent = await page.render({
						ctx,
						params: [ctx.session.stakeId],
					})

					void bot.api.editMessageText(
						ctx.chatId,
						messageIdToEdit,
						pageContent.message + '\n\n❌ not a number',
						{ reply_markup: pageContent.keyboard },
					)
				} else {
					ctx.session = {
						activeFlow: 'ticket-purchase',
						step: 'confirming',
						ticketAmount: ticketAmount,
						stakeId: ctx.session.stakeId,
					}

					const page = pageRegistry[pageIds.confirmPurchase]

					const pageContent = await page.render({ ctx })

					void bot.api.editMessageText(
						ctx.chatId,
						messageIdToEdit,
						pageContent.message,
						{ reply_markup: pageContent.keyboard },
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

async function open(ctx: Context, pageContent: PageContent) {
	await ctx.editMessageText(pageContent.message, {
		reply_markup: pageContent.keyboard,
	})
}

void bot.api.setMyCommands([{ command: 'start', description: 'Start the bot' }])

run(bot)
