import { Filter, GrammyError } from 'grammy'
import { getRounds, getStakes } from './api/endpoints/rips'
import { getBalance } from './api/endpoints/wallets'
import { parseCommand } from './commands'
import { enterHomeFlow } from './flows/home'
import {
	enterBuyingStep,
	enterConfirmingStep,
	enterTicketAmountStep,
} from './flows/ticket-purchase'
import { AboutPage } from './pages/content/about-page'
import { ChooseStakePage } from './pages/content/choose-stake-page'
import { FinishedRoundsPage } from './pages/content/finished-rounds-page'
import { PlayPage } from './pages/content/play-page'
import { StatusPage } from './pages/content/status-page'
import { WalletPage } from './pages/content/wallet-page'
import { pageIds } from './pages/page-ids'
import { CustomTicketAmountPrompt } from './prompts/custom-ticket-amount-prompt'
import { promptIds } from './prompts/prompt-ids'
import { ActiveFlow, Context, PageContent, TicketPurchaseStep } from './types'
import { composePageContentWithError } from './utils/error-to-render'
import { editMessage, getCurrentPage } from './utils/grammy'

const processingUsers = new Set<number>()

export async function handleButton(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	const userId = ctx.from.id

	if (processingUsers.has(userId)) return

	processingUsers.add(userId)

	try {
		return await handleButtonLogic(ctx)
	} catch (error) {
		if (error instanceof GrammyError) throw error

		const currentPageContent = getCurrentPage(ctx)
		const pageContent = composePageContentWithError(
			currentPageContent,
			error,
		)

		await ctx.editMessageText(pageContent.message, {
			reply_markup: pageContent.keyboard,
		})
	} finally {
		processingUsers.delete(userId)
	}
}

export async function handleButtonLogic(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	ctx.answerCallbackQuery().catch((error) => console.log(error))

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

					const currentPage = getCurrentPage(ctx)

					ctx.session = {
						activeFlow: ActiveFlow.TicketPurchase,
						step: TicketPurchaseStep.WaitingForInput,
						messageToEdit: {
							pageContent: currentPage,
							messageId:
								ctx.update.callback_query.message!.message_id,
						},
						stakeId: ctx.session.stakeId,
					}

					const promptContent = CustomTicketAmountPrompt.render()

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
}

async function openPage(
	ctx: Context,
	pageId: string,
	payloads?: string[],
): Promise<PageContent | null> {
	switch (pageId) {
		case pageIds.home:
			return enterHomeFlow(ctx)

		case pageIds.about:
			return AboutPage.render()

		case pageIds.wallet: {
			const telegramId = BigInt(ctx.from!.id)

			await ctx.editMessageText('loading...')

			const balance = await getBalance(telegramId)

			return WalletPage.render(balance)
		}

		case pageIds.play:
			return PlayPage.render()

		case pageIds.chooseStake: {
			const stakes = await getStakes()
			return ChooseStakePage.render(stakes)
		}

		case pageIds.chooseTicketAmount: {
			const stakeId = payloads?.[0]

			if (stakeId === undefined) {
				throw Error('stakeId is required for chooseTicketAmount')
			}

			return await enterTicketAmountStep(ctx, stakeId)
		}

		case pageIds.confirmPurchase: {
			const sessionData = ctx.session

			if (
				sessionData.activeFlow !== ActiveFlow.TicketPurchase ||
				sessionData.step !== TicketPurchaseStep.ChoosingTicketAmount
			) {
				throw Error('wrong session state for confirmPurchase')
			}

			const ticketAmount = Number(payloads![0])

			return await enterConfirmingStep(
				ctx,
				sessionData.stakeId,
				ticketAmount,
			)
		}

		case pageIds.status: {
			const rounds = await getRounds()
			return StatusPage.render(rounds)
		}

		case pageIds.finishedRounds: {
			const rounds = await getRounds()
			return FinishedRoundsPage.render(rounds)
		}

		case pageIds.successPurchase: {
			const sessionData = ctx.session

			if (
				sessionData.activeFlow !== ActiveFlow.TicketPurchase ||
				sessionData.step !== TicketPurchaseStep.Confirming
			) {
				throw Error('wrong session state for successPurchase')
			}

			return await enterBuyingStep(
				ctx,
				sessionData.stakeId,
				sessionData.ticketAmount,
			)
		}

		default:
			throw Error(`unknown pageId: ${pageId}`)
	}
}
