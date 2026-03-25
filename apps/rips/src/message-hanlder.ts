import { Bot, Filter, GrammyError } from 'grammy'
import { getBalance } from './api/endpoints/wallets'
import { enterConfirmingStep } from './flows/ticket-purchase'
import {
	enterChoosingAddressStep,
	enterConfirmWithdrawStep,
} from './flows/withdraw'
import { ActiveFlow, Context, TicketPurchaseStep, WithdrawStep } from './types'
import { fireAndForget } from './utils/common'
import {
	composePageContentWithError,
	ErrorToRender,
} from './utils/error-to-render'
import { editSpecificMessage } from './utils/grammy'
import { parseUnits } from './utils/units'

export async function handleMessage(
	ctx: Filter<Context, 'message:text'>,
	bot: Bot<Context>,
) {
	const repliedTo = ctx.message.reply_to_message

	if (!repliedTo || repliedTo.from?.id !== ctx.me.id) {
		console.log('not replyed message')
		return
	}

	switch (ctx.session.activeFlow) {
		case ActiveFlow.TicketPurchase: {
			if (ctx.session.step === TicketPurchaseStep.WaitingForInput) {
				const messageIdToEdit = ctx.session.messageToEdit.messageId
				const stakeId = ctx.session.stakeId

				try {
					const ticketAmount = parseTicketNumber(
						ctx.update.message.text,
					)
					const pageContent = await enterConfirmingStep(
						ctx,
						stakeId,
						ticketAmount,
					)

					fireAndForget(
						editSpecificMessage(
							bot,
							ctx.chatId,
							messageIdToEdit,
							pageContent,
						),
					)
				} catch (error) {
					if (error instanceof GrammyError) throw error

					const pageContent = composePageContentWithError(
						ctx.session.messageToEdit.pageContent,
						error,
					)

					fireAndForget(
						editSpecificMessage(
							bot,
							ctx.chatId,
							messageIdToEdit,
							pageContent,
						),
					)
				} finally {
					bot.api
						.deleteMessages(ctx.chatId, [
							repliedTo.message_id,
							ctx.update.message.message_id,
						])
						.catch((error) => console.log(error))
				}
			}

			break
		}

		case ActiveFlow.Withdraw: {
			const session = ctx.session

			if (session.step === WithdrawStep.WaitingForAmount) {
				const messageIdToEdit = session.messageToEdit.messageId

				try {
					if (ctx.from === undefined)
						throw new Error('ctx.from is undefined')

					const telegramId = BigInt(ctx.from.id)
					const balance = await getBalance(telegramId)
					const amount = parseWithdrawAmount(
						ctx.update.message.text,
						balance.currency.decimals,
						BigInt(balance.amount),
					)

					await enterChoosingAddressStep(
						ctx,
						amount,
						session.messageToEdit,
					)
				} catch (error) {
					if (error instanceof GrammyError) throw error

					const pageContent = composePageContentWithError(
						session.messageToEdit.pageContent,
						error,
					)

					fireAndForget(
						editSpecificMessage(
							bot,
							ctx.chatId,
							messageIdToEdit,
							pageContent,
						),
					)
				} finally {
					bot.api
						.deleteMessages(ctx.chatId, [
							repliedTo.message_id,
							ctx.update.message.message_id,
						])
						.catch((error) => console.log(error))
				}
			} else if (session.step === WithdrawStep.WaitingForAddress) {
				const messageIdToEdit = session.messageToEdit.messageId

				try {
					const pageContent = await enterConfirmWithdrawStep(
						ctx,
						session.amount,
						ctx.update.message.text,
					)

					fireAndForget(
						editSpecificMessage(
							bot,
							ctx.chatId,
							messageIdToEdit,
							pageContent,
						),
					)
				} catch (error) {
					if (error instanceof GrammyError) throw error

					const pageContent = composePageContentWithError(
						session.messageToEdit.pageContent,
						error,
					)

					fireAndForget(
						editSpecificMessage(
							bot,
							ctx.chatId,
							messageIdToEdit,
							pageContent,
						),
					)
				} finally {
					bot.api
						.deleteMessages(ctx.chatId, [
							repliedTo.message_id,
							ctx.update.message.message_id,
						])
						.catch((error) => console.log(error))
				}
			}

			break
		}
	}
}

function parseTicketNumber(userInput: string): number {
	const ticketAmount = Number(userInput)

	if (isNaN(ticketAmount)) {
		throw new ErrorToRender('Not a number')
	}

	if (ticketAmount < 0) {
		throw new ErrorToRender('Number should be more than 0')
	}

	if (!Number.isSafeInteger(ticketAmount)) {
		throw new ErrorToRender('Number should be integer')
	}

	return ticketAmount
}

function parseWithdrawAmount(
	input: string,
	decimals: number,
	availableAmount: bigint,
): string {
	let amount: bigint

	try {
		amount = parseUnits(input, decimals)
	} catch {
		throw new ErrorToRender('Invalid amount')
	}

	if (amount <= 0n) {
		throw new ErrorToRender('Amount must be greater than 0')
	}

	if (amount > availableAmount) {
		throw new ErrorToRender('Amount exceeds available balance')
	}

	return amount.toString()
}
