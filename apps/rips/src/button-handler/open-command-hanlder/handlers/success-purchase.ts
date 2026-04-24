import { Filter } from 'grammy'
import { enterBuyingStep } from '../../../flows/ticket-purchase'
import { ActiveFlow, Context, TicketPurchaseStep } from '../../../types'
import { editMessage } from '../../../utils/grammy'

export async function handleBuySuccessPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
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
}
