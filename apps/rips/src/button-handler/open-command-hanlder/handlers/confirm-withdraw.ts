import { Filter } from 'grammy'
import { enterConfirmWithdrawStep } from '../../../flows/withdraw'
import { ActiveFlow, Context, WithdrawStep } from '../../../types'
import { editMessage } from '../../../utils/grammy'

export async function handleConfirmWithdrawPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	const sessionData = ctx.session

	if (
		sessionData.activeFlow !== ActiveFlow.Withdraw ||
		sessionData.step !== WithdrawStep.Confirming
	) {
		throw new Error('wrong session state for confirmWithdraw')
	}

	const confirmWithdrawPage = await enterConfirmWithdrawStep(
		ctx,
		sessionData.amount,
		sessionData.recipientAddress,
	)

	await editMessage(ctx, confirmWithdrawPage)
}
