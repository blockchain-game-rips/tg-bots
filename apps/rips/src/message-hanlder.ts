import { Bot, Filter, GrammyError } from 'grammy'
import { enterConfirmingStep } from './flows/ticket-purchase'
import { ActiveFlow, Context, TicketPurchaseStep } from './types'
import {
	composePageContentWithError,
	ErrorToRender,
} from './utils/error-to-render'

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

					bot.api
						.editMessageText(
							ctx.chatId,
							messageIdToEdit,
							pageContent.message,
							{ reply_markup: pageContent.keyboard },
						)
						.catch((error) => console.log(error))
				} catch (error) {
					if (error instanceof GrammyError) throw error

					const messageToEdit = ctx.session.messageToEdit
					const currentPageContent = messageToEdit.pageContent

					const pageContent = composePageContentWithError(
						currentPageContent,
						error,
					)

					bot.api
						.editMessageText(
							ctx.chatId,
							messageToEdit.messageId,
							pageContent.message,
							{ reply_markup: pageContent.keyboard },
						)
						.catch((error) => console.log(error))
				} finally {
					bot.api
						.deleteMessages(ctx.chatId, [
							repliedTo.message_id,
							ctx.update.message.message_id,
						])
						.catch((error) => console.log(error))
				}
			}
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
