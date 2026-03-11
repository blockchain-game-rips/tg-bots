import { Bot, Filter } from "grammy"
import { ChooseTicketAmountPage } from "./pages/choose-ticket-amount/choose-ticket-amount-page"
import { ConfirmPurchasePage } from "./pages/confirm-purchase/confirm-purchase-page"
import { getStakesMock } from "./services/stake.service"
import { ActiveFlow, Context, TicketPurchaseStep } from "./types"

export async function handleMessage(ctx: Filter<Context, 'message:text'>, bot: Bot<Context>) {
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

				if (validation.isValid) {
					const stakes = await getStakesMock()
					const stake = stakes.find(
						(s) => s.stakeId.toString() === stakeId,
					)

					if (stake === undefined) {
						throw Error(`stakeId ${stakeId} is invalid`)
					}

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
					const stakes = await getStakesMock()
					const stake = stakes.find(
						(s) => s.stakeId.toString() === stakeId,
					)

					if (stake === undefined) {
						throw Error(`stakeId ${stakeId} is invalid`)
					}

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
}

function validateTicketNumber(
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
