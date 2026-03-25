import { Filter } from 'grammy'
import { enterConfirmingStep } from '../../../flows/ticket-purchase'
import { ActiveFlow, Context, TicketPurchaseStep } from '../../../types'
import { editMessage } from '../../../utils/grammy'

export async function handleConfirmPurchasePageId(
	ctx: Filter<Context, 'callback_query:data'>,
	payloads: string[],
) {
	const sessionData = ctx.session

	if (
		sessionData.activeFlow !== ActiveFlow.TicketPurchase ||
		sessionData.step !== TicketPurchaseStep.ChoosingTicketAmount
	) {
		throw Error('wrong session state for confirmPurchase')
	}

	const ticketAmount = Number(payloads[0])

	const confirmPurchasePage = await enterConfirmingStep(
		ctx,
		sessionData.stakeId,
		ticketAmount,
	)

	await editMessage(ctx, confirmPurchasePage)
}
