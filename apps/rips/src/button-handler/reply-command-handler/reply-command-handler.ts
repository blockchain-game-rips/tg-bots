import { Filter } from 'grammy'
import { promptIds } from '../../prompts/prompt-ids'
import { Context } from '../../types'
import { handleCustomTicketAmountPromptId } from './handlers/custom-ticket-amount'
import { handleCustomWithdrawAmountPromptId } from './handlers/custom-withdraw-amount'

export async function handleReplyCommand(
	ctx: Filter<Context, 'callback_query:data'>,
	promptId: string,
) {
	switch (promptId) {
		case promptIds.customTicketAmount:
			return await handleCustomTicketAmountPromptId(ctx)

		case promptIds.customWithdrawAmount:
			return await handleCustomWithdrawAmountPromptId(ctx)
	}
}
