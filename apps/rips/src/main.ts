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
import { getStakesMock } from './services/stake.service'
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

const customTicketAmountPrompt = new CustomTicketAmountPrompt()

bot.command('start', async (ctx) => {
	const page = HomePage.render()

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

				const validation = validateTicketNumber(ctx.update.message.text)

				const stakes = await getStakesMock()
				const stake = stakes.find(
					(s) => s.stakeId.toString() === stakeId,
				)

				if (stake === undefined) {
					console.log(`stakeId ${stakeId} is invalid`)
					return
				}

				if (validation.isValid) {
					ctx.session = {
						activeFlow: ActiveFlow.TicketPurchase,
						step: TicketPurchaseStep.Confirming,
						ticketAmount: validation.ticketAmount,
						stakeId,
					}

					const pageContent = ConfirmPurchasePage.render(
						stake,
						validation.ticketAmount,
					)

					void bot.api.editMessageText(
						ctx.chatId,
						messageIdToEdit,
						pageContent.message,
						{ reply_markup: pageContent.keyboard },
					)
				} else {
					ctx.session = {
						activeFlow: ActiveFlow.TicketPurchase,
						stakeId,
						step: TicketPurchaseStep.ChoosingTicketAmount,
					}

					const pageContent = ChooseTicketAmountPage.render(stake)

					void bot.api.editMessageText(
						ctx.chatId,
						messageIdToEdit,
						pageContent.message + `\n\n${validation.reasonMessage}`,
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

export function validateTicketNumber(
	userInput: string,
):
	| { isValid: true; ticketAmount: number }
	| { isValid: false; reasonMessage: string } {
	const ticketAmount = Number(userInput)

	if (isNaN(ticketAmount)) {
		return { isValid: false, reasonMessage: '❌ Not a number' }
	}

	if (ticketAmount < 0) {
		return {
			isValid: false,
			reasonMessage: '❌ Number should be more than 0',
		}
	}

	if (!Number.isSafeInteger(ticketAmount)) {
		return { isValid: false, reasonMessage: '❌ Number should be integer' }
	}

	return { isValid: true, ticketAmount }
}

async function openPage(
	ctx: Context,
	pageId: string,
	payloads?: string[],
): Promise<PageContent | null> {
	switch (pageId) {
		case pageIds.home:
			return HomePage.render()

		case pageIds.about:
			return AboutPage.render()

		case pageIds.play:
			return PlayPage.render()

		case pageIds.chooseStake: {
			const stakes = await getStakesMock()
			return ChooseStakePage.render(stakes)
		}

		case pageIds.chooseTicketAmount: {
			const stakeId = payloads?.[0]

			if (stakeId === undefined) {
				console.log('stakeId is required for chooseTicketAmount')
				return null
			}

			const stakes = await getStakesMock()
			const stake = stakes.find((s) => s.stakeId.toString() === stakeId)

			if (stake === undefined) {
				console.log(`stakeId ${stakeId} is invalid`)
				return null
			}

			ctx.session = {
				activeFlow: ActiveFlow.TicketPurchase,
				stakeId,
				step: TicketPurchaseStep.ChoosingTicketAmount,
			}

			return ChooseTicketAmountPage.render(stake)
		}

		case pageIds.confirmPurchase: {
			const sessionData = ctx.session

			if (
				sessionData.activeFlow !== ActiveFlow.TicketPurchase ||
				sessionData.step !== TicketPurchaseStep.ChoosingTicketAmount
			) {
				console.log('wrong session state for confirmPurchase')
				return null
			}

			const stakes = await getStakesMock()
			const stake = stakes.find(
				(s) => s.stakeId.toString() === sessionData.stakeId,
			)

			if (stake === undefined) {
				console.log(`stakeId ${sessionData.stakeId} is invalid`)
				return null
			}

			const ticketAmount = Number(payloads![0])

			ctx.session = {
				activeFlow: ActiveFlow.TicketPurchase,
				step: TicketPurchaseStep.Confirming,
				ticketAmount: ticketAmount,
				stakeId: stake.stakeId.toString(),
			}

			return ConfirmPurchasePage.render(stake, ticketAmount)
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
