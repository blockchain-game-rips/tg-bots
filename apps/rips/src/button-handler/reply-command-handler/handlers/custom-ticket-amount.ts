import { Filter } from 'grammy'
import { CustomTicketAmountPrompt } from '../../../prompts/custom-ticket-amount-prompt'
import { ActiveFlow, Context, TicketPurchaseStep } from '../../../types'
import { getCurrentPage } from '../../utils'

export async function handleCustomTicketAmountPromptId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	if (ctx.session.activeFlow !== ActiveFlow.TicketPurchase) {
		throw new Error('activeFlow should be ticket-purchase')
	}

	const currentPage = getCurrentPage(ctx)
	const messageId = ctx.update.callback_query.message!.message_id

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
			input_field_placeholder: ticketAmountPrompt.placeholder,
		},
	})
}
