import { Filter } from 'grammy'
import { getRounds, getStakes } from '../api/endpoints/rips'
import {
	getUnrevealedPrizes,
	getUser,
	revealTicketPrizes,
} from '../api/endpoints/users'
import { getBalance } from '../api/endpoints/wallets'
import { enterHomeFlow } from '../flows/home'
import {
	enterBuyingStep,
	enterConfirmingStep,
	enterTicketAmountStep,
} from '../flows/ticket-purchase'
import {
	enterChoosingAddressStep,
	enterConfirmWithdrawStep,
	enterWithdrawalStep,
} from '../flows/withdraw'
import { AboutPage } from '../pages/content/about-page'
import { ActiveRoundsPage } from '../pages/content/active-rounds-page'
import { ChooseStakePage } from '../pages/content/choose-stake-page'
import {
	ChooseWithdrawAmountPage,
	MAX_AMOUNT_PAYLOAD,
} from '../pages/content/choose-withdraw-amount-page'
import { FinishedRoundsPage } from '../pages/content/finished-rounds-page'
import { PlayPage } from '../pages/content/play-page'
import {
	REVEAL_ALL_PAYLOAD,
	REVEAL_ONE_PAYLOAD,
	RevealPrizesPage,
} from '../pages/content/reveal-prizes-page'
import { EIP155_NAMESPACE, StatusPage } from '../pages/content/status-page'
import { WalletPage } from '../pages/content/wallet-page'
import { pageIds } from '../pages/page-ids'
import { CustomTicketAmountPrompt } from '../prompts/custom-ticket-amount-prompt'
import { CustomWithdrawAmountPrompt } from '../prompts/custom-withdraw-amount-prompt'
import { promptIds } from '../prompts/prompt-ids'
import { ActiveFlow, Context, TicketPurchaseStep, WithdrawStep } from '../types'
import { editMessage } from '../utils/grammy'
import { Command } from './types'
import { getCurrentPage } from './utils'

export async function handleButtonCommand(
	command: Command,
	ctx: Filter<Context, 'callback_query:data'>,
) {
	switch (command.type) {
		case 'open': {
			await handleOpenCommand(ctx, command.pageId, command.payloads)

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

async function handleOpenCommand(
	ctx: Filter<Context, 'callback_query:data'>,
	pageId: string,
	payloads?: string[],
): Promise<void> {
	switch (pageId) {
		case pageIds.home: {
			const homePage = await enterHomeFlow(ctx)

			await editMessage(ctx, homePage)

			break
		}

		case pageIds.about: {
			const aboutPage = AboutPage.render()

			await editMessage(ctx, aboutPage)

			break
		}

		case pageIds.wallet: {
			const from = ctx.from

			if (!from) throw Error('ctx.from is undefinded')

			const telegramId = BigInt(ctx.from.id)

			await ctx.editMessageText('loading...')

			const balance = await getBalance(telegramId)
			const walletPage = WalletPage.render(balance)

			await editMessage(ctx, walletPage)

			break
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

				await enterChoosingAddressStep(ctx, balance.amount, {
					pageContent: currentPage,
					messageId,
				})

				break
			}

			const balance = await getBalance(telegramId)
			const chooseWithdrawAmountPage =
				ChooseWithdrawAmountPage.render(balance)

			await editMessage(ctx, chooseWithdrawAmountPage)

			break
		}

		case pageIds.confirmWithdraw: {
			const sessionData = ctx.session

			if (
				sessionData.activeFlow !== ActiveFlow.Withdraw ||
				sessionData.step !== WithdrawStep.Confirming
			) {
				throw new Error('wrong session state for confirmWithdraw')
			}

			const confirmWithdrawPage = await enterConfirmWithdrawStep(
				ctx,
				sessionData.amount,
				sessionData.recipientAddress,
			)

			await editMessage(ctx, confirmWithdrawPage)

			break
		}

		case pageIds.successWithdraw: {
			const sessionData = ctx.session

			if (
				sessionData.activeFlow !== ActiveFlow.Withdraw ||
				sessionData.step !== WithdrawStep.Confirming
			) {
				throw new Error('wrong session state for successWithdraw')
			}

			const successWithdrawPage = await enterWithdrawalStep(
				ctx,
				sessionData.amount,
				sessionData.recipientAddress,
			)

			await editMessage(ctx, successWithdrawPage)

			break
		}

		case pageIds.play: {
			if (ctx.from === undefined) {
				throw new Error('ctx.from is undefined')
			}

			const telegramId = BigInt(ctx.from.id)
			const prizes = await getUnrevealedPrizes(telegramId)
			const playPage = PlayPage.render(prizes.length > 0)

			await editMessage(ctx, playPage)

			break
		}

		case pageIds.chooseStake: {
			const stakes = await getStakes()
			const chooseStakePage = ChooseStakePage.render(stakes)

			await editMessage(ctx, chooseStakePage)

			break
		}

		case pageIds.chooseTicketAmount: {
			const stakeId = payloads?.[0]

			if (stakeId === undefined) {
				throw Error('stakeId is required for chooseTicketAmount')
			}

			const chooseTicketAmountPage = await enterTicketAmountStep(
				ctx,
				stakeId,
			)

			await editMessage(ctx, chooseTicketAmountPage)

			break
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

			const confirmPurchasePage = await enterConfirmingStep(
				ctx,
				sessionData.stakeId,
				ticketAmount,
			)

			await editMessage(ctx, confirmPurchasePage)

			break
		}

		case pageIds.openRips: {
			if (ctx.from === undefined) {
				throw new Error('ctx.from is undefined')
			}

			const telegramId = BigInt(ctx.from.id)
			const prizes = await getUnrevealedPrizes(telegramId)
			const revealPrizesPage = RevealPrizesPage.render(prizes)

			await editMessage(ctx, revealPrizesPage)

			break
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
				const revealedPrizesPage = RevealPrizesPage.render(
					unrevealed,
					revealed,
				)

				await editMessage(ctx, revealedPrizesPage)

				break
			}

			const prizes = await getUnrevealedPrizes(telegramId)
			const revealPrizesPage = RevealPrizesPage.render(prizes)

			await editMessage(ctx, revealPrizesPage)

			break
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

			const statusPage = StatusPage.render(rounds, userEvmAddress)

			await editMessage(ctx, statusPage)

			break
		}

		case pageIds.activeRounds: {
			const rounds = await getRounds()
			const activeRoundsPage = ActiveRoundsPage.render(rounds)

			await editMessage(ctx, activeRoundsPage)

			break
		}

		case pageIds.finishedRounds: {
			const rounds = await getRounds()
			const finishedRoundsPage = FinishedRoundsPage.render(rounds)

			await editMessage(ctx, finishedRoundsPage)

			break
		}

		case pageIds.successPurchase: {
			const sessionData = ctx.session

			if (
				sessionData.activeFlow !== ActiveFlow.TicketPurchase ||
				sessionData.step !== TicketPurchaseStep.Confirming
			) {
				throw Error('wrong session state for successPurchase')
			}

			const successPurchasePage = await enterBuyingStep(
				ctx,
				sessionData.stakeId,
				sessionData.ticketAmount,
			)

			await editMessage(ctx, successPurchasePage)

			break
		}

		default:
			throw Error(`unknown pageId: ${pageId}`)
	}
}
