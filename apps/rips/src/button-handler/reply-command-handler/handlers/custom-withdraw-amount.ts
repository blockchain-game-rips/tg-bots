import { Filter } from 'grammy'
import { enterChoosingCustomAmountStep } from '../../../flows/withdraw'
import { ActiveFlow, Context, WithdrawStep } from '../../../types'
import { getCurrentPage } from '../../utils'

export async function handleCustomWithdrawAmountPromptId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	const currentPage = getCurrentPage(ctx)
	const messageId = ctx.update.callback_query.message!.message_id

	const session = ctx.session
	const existingRecipientAddress =
		session.activeFlow === ActiveFlow.Withdraw &&
		session.step === WithdrawStep.OnWithdrawPage
			? session.recipientAddress
			: undefined

	await enterChoosingCustomAmountStep(
		ctx,
		{ pageContent: currentPage, messageId },
		existingRecipientAddress,
	)
}
