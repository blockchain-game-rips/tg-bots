import { Filter } from 'grammy'
import { enterTicketAmountStep } from '../../../flows/ticket-purchase'
import { Context } from '../../../types'
import { editMessage } from '../../../utils/grammy'

export async function handleChooseTicketCountPageId(
	ctx: Filter<Context, 'callback_query:data'>,
	payloads: string[],
) {
	const stakeId = payloads[0]

	if (stakeId === undefined) {
		throw Error('stakeId is required for chooseTicketAmount')
	}

	const chooseTicketAmountPage = await enterTicketAmountStep(ctx, stakeId)

	await editMessage(ctx, chooseTicketAmountPage)
}
