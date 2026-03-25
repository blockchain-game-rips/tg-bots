import { Filter } from 'grammy'
import { enterWithdrawalStep } from '../../../flows/withdraw'
import { ActiveFlow, Context, WithdrawStep } from '../../../types'
import { editMessage } from '../../../utils/grammy'

export async function handleSuccessWithdrawPageId(
	ctx: Filter<Context, 'callback_query:data'>,
) {
	const session = ctx.session

	if (
		session.activeFlow !== ActiveFlow.Withdraw ||
		session.step !== WithdrawStep.OnWithdrawPage
	) {
		throw new Error('wrong session state for successWithdraw')
	}

	const { amount, recipientAddress } = session

	if (amount === undefined || recipientAddress === undefined) {
		throw new Error('amount and recipientAddress must be set to withdraw')
	}

	const successWithdrawPage = await enterWithdrawalStep(
		ctx,
		amount,
		recipientAddress,
	)

	await editMessage(ctx, successWithdrawPage)
}
