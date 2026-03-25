import { Filter } from 'grammy'
import { enterChoosingRecipientStep } from '../../../flows/withdraw'
import { ActiveFlow, Context, WithdrawStep } from '../../../types'
import { getCurrentPage } from '../../utils'

export async function handleWithdrawRecipientPromptId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	const currentPage = getCurrentPage(ctx)
	const messageId = ctx.update.callback_query.message!.message_id

	const session = ctx.session
	const existingAmount =
		session.activeFlow === ActiveFlow.Withdraw &&
		session.step === WithdrawStep.OnWithdrawPage
			? session.amount
			: undefined

	await enterChoosingRecipientStep(
		ctx,
		{ pageContent: currentPage, messageId },
		existingAmount,
	)
}
