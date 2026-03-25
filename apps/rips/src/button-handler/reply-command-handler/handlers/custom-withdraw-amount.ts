import { Filter } from 'grammy'
import { CustomWithdrawAmountPrompt } from '../../../prompts/custom-withdraw-amount-prompt'
import { ActiveFlow, Context, WithdrawStep } from '../../../types'
import { getCurrentPage } from '../../utils'

export async function handleCustomWithdrawAmountPromptId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	const currentPage = getCurrentPage(ctx)
	const messageId = ctx.update.callback_query.message!.message_id

	ctx.session = {
		activeFlow: ActiveFlow.Withdraw,
		step: WithdrawStep.WaitingForAmount,
		messageToEdit: { pageContent: currentPage, messageId },
	}

	const withdrawAmountPrompt = CustomWithdrawAmountPrompt.render()

	await ctx.reply(withdrawAmountPrompt.message, {
		reply_markup: {
			force_reply: true,
			input_field_placeholder: withdrawAmountPrompt.placeholder,
		},
	})
}
