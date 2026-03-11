import { Bot, Filter } from 'grammy'
import { ErrorToRender, getErrorMessageToRender } from './error-to-render'
import { enterConfirmingStep } from './flows/ticket-purchase'
import { ActiveFlow, Context, TicketPurchaseStep } from './types'

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
				try {
					const messageIdToEdit = ctx.session.messageToEdit.messageId
					const stakeId = ctx.session.stakeId

					const ticketAmount = parseTicketNumber(
						ctx.update.message.text,
					)

					const pageContent = await enterConfirmingStep(
						ctx,
						stakeId,
						ticketAmount,
					)

					void bot.api.editMessageText(
						ctx.chatId,
						messageIdToEdit,
						pageContent.message,
						{ reply_markup: pageContent.keyboard },
					)
				} catch (error) {
					const errorMessageToRender = getErrorMessageToRender(error)
					const messageToEdit = ctx.session.messageToEdit

					void bot.api.editMessageText(
						ctx.chatId,
						messageToEdit.messageId,
						messageToEdit.pageContent.message +
							`\n\n${errorMessageToRender}`,
						{ reply_markup: messageToEdit.pageContent.keyboard },
					)
				} finally {
					void bot.api.deleteMessages(ctx.chatId, [
						repliedTo.message_id,
						ctx.update.message.message_id,
					])
				}
			}
		}
	}
}

function parseTicketNumber(userInput: string): number {
	const ticketAmount = Number(userInput)

	if (isNaN(ticketAmount)) {
		throw new ErrorToRender('❌ Not a number')
	}

	if (ticketAmount < 0) {
		throw new ErrorToRender('❌ Number should be more than 0')
	}

	if (!Number.isSafeInteger(ticketAmount)) {
		throw new ErrorToRender('❌ Number should be integer')
	}

	return ticketAmount
}
