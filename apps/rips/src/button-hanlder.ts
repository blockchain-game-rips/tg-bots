import { Filter, GrammyError } from 'grammy'
import { getRounds, getStakes } from './api/endpoints/rips'
import {
	getUnrevealedPrizes,
	getUser,
	revealTicketPrizes,
} from './api/endpoints/users'
import { getBalance } from './api/endpoints/wallets'
import { parseCommand } from './commands'
import { enterHomeFlow } from './flows/home'
import {
	enterBuyingStep,
	enterConfirmingStep,
	enterTicketAmountStep,
} from './flows/ticket-purchase'
import {
	enterChoosingAddressStep,
	enterConfirmWithdrawStep,
	enterWithdrawalStep,
} from './flows/withdraw'
import { AboutPage } from './pages/content/about-page'
import { ActiveRoundsPage } from './pages/content/active-rounds-page'
import { ChooseStakePage } from './pages/content/choose-stake-page'
import {
	ChooseWithdrawAmountPage,
	MAX_AMOUNT_PAYLOAD,
} from './pages/content/choose-withdraw-amount-page'
import { FinishedRoundsPage } from './pages/content/finished-rounds-page'
import { PlayPage } from './pages/content/play-page'
import {
	REVEAL_ALL_PAYLOAD,
	REVEAL_ONE_PAYLOAD,
	RevealPrizesPage,
} from './pages/content/reveal-prizes-page'
import { EIP155_NAMESPACE, StatusPage } from './pages/content/status-page'
import { WalletPage } from './pages/content/wallet-page'
import { pageIds } from './pages/page-ids'
import { CustomTicketAmountPrompt } from './prompts/custom-ticket-amount-prompt'
import { CustomWithdrawAmountPrompt } from './prompts/custom-withdraw-amount-prompt'
import { promptIds } from './prompts/prompt-ids'
import {
	ActiveFlow,
	Context,
	PageContent,
	TicketPurchaseStep,
	WithdrawStep,
} from './types'
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
					const messageId =
						ctx.update.callback_query.message!.message_id

					ctx.session = {
						activeFlow: ActiveFlow.TicketPurchase,
						step: TicketPurchaseStep.WaitingForInput,
						messageToEdit: { pageContent: currentPage, messageId },
						stakeId: ctx.session.stakeId,
					}

					const ticketAmountPrompt = CustomTicketAmountPrompt.render()

					await ctx.reply(ticketAmountPrompt.message, {
						reply_markup: {
							force_reply: true,
							input_field_placeholder:
								ticketAmountPrompt.placeholder,
						},
					})

					break
				}

				case promptIds.customWithdrawAmount: {
					const currentPage = getCurrentPage(ctx)
					const messageId =
						ctx.update.callback_query.message!.message_id

					ctx.session = {
						activeFlow: ActiveFlow.Withdraw,
						step: WithdrawStep.WaitingForAmount,
						messageToEdit: { pageContent: currentPage, messageId },
					}

					const withdrawAmountPrompt =
						CustomWithdrawAmountPrompt.render()

					await ctx.reply(withdrawAmountPrompt.message, {
						reply_markup: {
							force_reply: true,
							input_field_placeholder:
								withdrawAmountPrompt.placeholder,
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
	ctx: Filter<Context, 'callback_query:data'>,
	pageId: string,
	payloads?: string[],
): Promise<PageContent | null> {
	switch (pageId) {
		case pageIds.home:
			return enterHomeFlow(ctx)

		case pageIds.about:
			return AboutPage.render()

		case pageIds.wallet: {
			const telegramId = BigInt(ctx.from.id)

			await ctx.editMessageText('loading...')

			const balance = await getBalance(telegramId)

			return WalletPage.render(balance)
		}

		case pageIds.chooseWithdrawAmount: {
			if (ctx.from === undefined) {
				throw new Error('ctx.from is undefined')
			}

			const telegramId = BigInt(ctx.from.id)
			const payload = payloads?.[0]

			if (payload === MAX_AMOUNT_PAYLOAD) {
				const balance = await getBalance(telegramId)

				const currentPage = getCurrentPage(ctx)
				const messageId = ctx.update.callback_query.message!.message_id

				return enterChoosingAddressStep(ctx, balance.amount, {
					pageContent: currentPage,
					messageId,
				})
			}

			const balance = await getBalance(telegramId)

			return ChooseWithdrawAmountPage.render(balance)
		}

		case pageIds.confirmWithdraw: {
			const sessionData = ctx.session

			if (
				sessionData.activeFlow !== ActiveFlow.Withdraw ||
				sessionData.step !== WithdrawStep.Confirming
			) {
				throw new Error('wrong session state for confirmWithdraw')
			}

			return enterConfirmWithdrawStep(
				ctx,
				sessionData.amount,
				sessionData.recipientAddress,
			)
		}

		case pageIds.successWithdraw: {
			const sessionData = ctx.session

			if (
				sessionData.activeFlow !== ActiveFlow.Withdraw ||
				sessionData.step !== WithdrawStep.Confirming
			) {
				throw new Error('wrong session state for successWithdraw')
			}

			return enterWithdrawalStep(
				ctx,
				sessionData.amount,
				sessionData.recipientAddress,
			)
		}

		case pageIds.play: {
			if (ctx.from === undefined) {
				throw new Error('ctx.from is undefined')
			}

			const telegramId = BigInt(ctx.from.id)
			const prizes = await getUnrevealedPrizes(telegramId)

			return PlayPage.render(prizes.length > 0)
		}

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

		case pageIds.openRips: {
			if (ctx.from === undefined) {
				throw new Error('ctx.from is undefined')
			}

			const telegramId = BigInt(ctx.from.id)
			const prizes = await getUnrevealedPrizes(telegramId)

			return RevealPrizesPage.render(prizes)
		}

		case pageIds.revealPrizes: {
			if (ctx.from === undefined) {
				throw new Error('ctx.from is undefined')
			}

			const telegramId = BigInt(ctx.from.id)
			const action = payloads?.[0]

			if (
				action === REVEAL_ONE_PAYLOAD ||
				action === REVEAL_ALL_PAYLOAD
			) {
				const revealAll = action === REVEAL_ALL_PAYLOAD
				const revealed = await revealTicketPrizes(telegramId, revealAll)
				const unrevealed = await getUnrevealedPrizes(telegramId)

				return RevealPrizesPage.render(unrevealed, revealed)
			}

			const prizes = await getUnrevealedPrizes(telegramId)

			return RevealPrizesPage.render(prizes)
		}

		case pageIds.status: {
			if (ctx.from === undefined) {
				throw new Error('ctx.from is undefined')
			}

			const telegramId = BigInt(ctx.from.id)

			const [rounds, user] = await Promise.all([
				getRounds(),
				getUser(telegramId),
			])

			const userEvmAddress = user.wallets[EIP155_NAMESPACE]

			if (userEvmAddress === undefined) {
				throw new Error('User has no EVM wallet')
			}

			return StatusPage.render(rounds, userEvmAddress)
		}

		case pageIds.activeRounds: {
			const rounds = await getRounds()
			return ActiveRoundsPage.render(rounds)
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
