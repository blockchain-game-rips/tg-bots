import { autoRetry } from '@grammyjs/auto-retry'
import { run } from '@grammyjs/runner'
import { Bot, session } from 'grammy'
import { parseCommand } from './commands'
import { AboutPage } from './pages/about/about-page'
import { ChooseStakePage } from './pages/choose-stake/choose-stake-page'
import { ChooseTicketAmountPage } from './pages/choose-ticket-amount/choose-ticket-amount-page'
import { ConfirmPurchasePage } from './pages/confirm-purchase/confirm-purchase-page'
import { HomePage } from './pages/home/home-page'
import { PageContent } from './pages/interfaces'
import { pageIds } from './pages/page-ids'
import { PlayPage } from './pages/play/play-page'
import { CustomTicketAmountPrompt } from './prompts/custom-ticket-amount-prompt'
import { promptIds } from './prompts/prompt-ids'
import { ActiveFlow, Context, SessionData, TicketPurchaseStep } from './types'
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

const homePage = new HomePage()
const aboutPage = new AboutPage()
const playPage = new PlayPage()
const chooseStakePage = new ChooseStakePage()
const chooseTicketAmountPage = new ChooseTicketAmountPage()
const confirmPurchasePage = new ConfirmPurchasePage()
const customTicketAmountPrompt = new CustomTicketAmountPrompt()

bot.command('start', async (ctx) => {
	const page = homePage.render()

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
			const pageContent = await openPage(
				ctx,
				command.pageId,
				command.payloads,
			)

			if (pageContent) {
				await editMessage(ctx, pageContent)
			}

			break
		}

		case 'reply': {
			switch (command.promptId) {
				case promptIds.customTicketAmount: {
					if (ctx.session.activeFlow !== ActiveFlow.TicketPurchase) {
						throw new Error('activeFlow should be ticket-purchase')
					}

					ctx.session = {
						activeFlow: ActiveFlow.TicketPurchase,
						step: TicketPurchaseStep.WaitingForInput,
						messageIdToEdit:
							ctx.update.callback_query.message!.message_id,
						stakeId: ctx.session.stakeId,
					}

					const promptContent = customTicketAmountPrompt.render()

					await ctx.reply(promptContent.message, {
						reply_markup: {
							force_reply: true,
							input_field_placeholder: promptContent.placeholder,
						},
					})

					break
				}
			}

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
		case ActiveFlow.TicketPurchase: {
			if (ctx.session.step === TicketPurchaseStep.WaitingForInput) {
				const messageIdToEdit = ctx.session.messageIdToEdit
				const stakeId = ctx.session.stakeId

				const ticketAmount = Number(ctx.update.message.text)

				if (isNaN(ticketAmount)) {
					ctx.session = {
						activeFlow: ActiveFlow.TicketPurchase,
						stakeId,
						step: TicketPurchaseStep.ChoosingTicketAmount,
					}

					const pageContent =
						await chooseTicketAmountPage.render(stakeId)

					void bot.api.editMessageText(
						ctx.chatId,
						messageIdToEdit,
						pageContent.message + '\n\n❌ not a number',
						{ reply_markup: pageContent.keyboard },
					)
				} else {
					ctx.session = {
						activeFlow: ActiveFlow.TicketPurchase,
						step: TicketPurchaseStep.Confirming,
						ticketAmount,
						stakeId,
					}

					const pageContent = await confirmPurchasePage.render(
						stakeId,
						ticketAmount,
					)

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

async function openPage(
	ctx: Context,
	pageId: string,
	payloads?: string[],
): Promise<PageContent | null> {
	switch (pageId) {
		case pageIds.home:
			return homePage.render()

		case pageIds.about:
			return aboutPage.render()

		case pageIds.play:
			return playPage.render()

		case pageIds.chooseStake:
			return chooseStakePage.render()

		case pageIds.chooseTicketAmount: {
			const stakeId = payloads?.[0]

			if (stakeId === undefined) {
				throw new Error('stakeId is required for chooseTicketAmount')
			}

			ctx.session = {
				activeFlow: ActiveFlow.TicketPurchase,
				stakeId,
				step: TicketPurchaseStep.ChoosingTicketAmount,
			}

			return chooseTicketAmountPage.render(stakeId)
		}

		case pageIds.confirmPurchase: {
			if (
				ctx.session.activeFlow !== ActiveFlow.TicketPurchase ||
				ctx.session.step !== TicketPurchaseStep.Confirming
			) {
				throw new Error('wrong session state for confirmPurchase')
			}

			return confirmPurchasePage.render(
				ctx.session.stakeId,
				ctx.session.ticketAmount,
			)
		}

		default:
			console.log(`unknown pageId: ${pageId}`)
			return null
	}
}

async function editMessage(ctx: Context, pageContent: PageContent) {
	await ctx.editMessageText(pageContent.message, {
		reply_markup: pageContent.keyboard,
	})
}

void bot.api.setMyCommands([{ command: 'start', description: 'Start the bot' }])

run(bot)
