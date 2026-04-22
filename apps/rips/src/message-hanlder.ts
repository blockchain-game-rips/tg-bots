import { Message } from '@grammyjs/types'
import { Bot, Filter, GrammyError } from 'grammy'
import { enterConfirmingStep } from './flows/ticket-purchase'
import { enterWithdrawPage } from './flows/withdraw'
import {
	ActiveFlow,
	Context,
	MessageToEdit,
	PageContent,
	TicketPurchaseStep,
	WithdrawStep,
} from './types'
import { fireAndForget } from './utils/common'
import {
	composePageContentWithError,
	ErrorToRender,
} from './utils/error-to-render'
import { editSpecificMessage } from './utils/grammy'
import { fetchNativeBalance, parseUnits } from './utils/units'

const EVM_ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/

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
				const { messageToEdit, stakeId } = ctx.session

				await handleFlowInput(
					bot,
					ctx,
					repliedTo,
					messageToEdit,
					() => {
						const ticketAmount = parseTicketNumber(
							ctx.update.message.text,
						)
						return enterConfirmingStep(ctx, stakeId, ticketAmount)
					},
				)
			}

			break
		}

		case ActiveFlow.Withdraw: {
			const session = ctx.session

			if (session.step === WithdrawStep.WaitingForRecipient) {
				const { messageToEdit, amount } = session

				await handleFlowInput(
					bot,
					ctx,
					repliedTo,
					messageToEdit,
					() => {
						const recipientAddress = parseRecipientAddress(
							ctx.update.message.text,
						)
						return enterWithdrawPage(
							ctx,
							messageToEdit,
							amount,
							recipientAddress,
						)
					},
				)
			} else if (session.step === WithdrawStep.WaitingForCustomAmount) {
				const { messageToEdit, recipientAddress } = session

				await handleFlowInput(
					bot,
					ctx,
					repliedTo,
					messageToEdit,
					async () => {
						const telegramId = String(ctx.from.id)
						const balance = await fetchNativeBalance(telegramId)

						const amount = parseWithdrawAmount(
							ctx.update.message.text,
							balance.currency.decimals,
							BigInt(balance.amount),
						)

						return enterWithdrawPage(
							ctx,
							messageToEdit,
							amount,
							recipientAddress,
						)
					},
				)
			}

			break
		}
	}
}

async function handleFlowInput(
	bot: Bot<Context>,
	ctx: Filter<Context, 'message:text'>,
	repliedTo: Message,
	messageToEdit: MessageToEdit,
	action: () => Promise<PageContent>,
): Promise<void> {
	const { messageId, pageContent } = messageToEdit

	try {
		const result = await action()
		fireAndForget(editSpecificMessage(bot, ctx.chatId, messageId, result))
	} catch (error) {
		if (error instanceof GrammyError) throw error
		const errorPage = composePageContentWithError(pageContent, error)
		fireAndForget(
			editSpecificMessage(bot, ctx.chatId, messageId, errorPage),
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

function parseRecipientAddress(input: string): string {
	if (!EVM_ADDRESS_REGEX.test(input)) {
		throw new ErrorToRender('Invalid address format')
	}

	return input
}

function parseWithdrawAmount(
	input: string,
	decimals: number,
	userBalance: bigint,
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

	if (amount > userBalance) {
		throw new ErrorToRender('Amount exceeds available to withdraw balance')
	}

	return amount.toString()
}
