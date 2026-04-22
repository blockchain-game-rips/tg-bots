import { Filter } from 'grammy'
import { walletsControllerGetBalances } from '../../../../generated/api-client'
import { NATIVE_ON_BASE } from '../../../constants'
import { enterWithdrawPage } from '../../../flows/withdraw'
import {
	ChooseWithdrawAmountPage,
	MAX_AMOUNT_PAYLOAD,
} from '../../../pages/content/choose-withdraw-amount-page'
import { ActiveFlow, Context, WithdrawStep } from '../../../types'
import { editMessage } from '../../../utils/grammy'
import { chainAddressToString } from '../../../utils/units'
import { getCurrentPage } from '../../utils'

export async function handleChooseWithdrawAmountPageId(
	ctx: Filter<Context, 'callback_query:data'>,
	payloads: string[],
) {
	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = String(ctx.from.id)
	const payload = payloads[0]
	const currentPage = getCurrentPage(ctx)
	const messageId = ctx.update.callback_query.message!.message_id

	const session = ctx.session
	const existingRecipientAddress =
		session.activeFlow === ActiveFlow.Withdraw &&
		session.step === WithdrawStep.OnWithdrawPage
			? session.recipientAddress
			: undefined

	const { data: balancesData } = await walletsControllerGetBalances({
		headers: { 'x-telegram-id': telegramId },
		query: { chainAddress: [chainAddressToString(NATIVE_ON_BASE)] },
		throwOnError: true,
	})

	const balance = balancesData.balances[0]

	if (balance === undefined) {
		throw new Error('No balance found for native asset')
	}

	if (payload === MAX_AMOUNT_PAYLOAD) {
		const withdrawPage = await enterWithdrawPage(
			ctx,
			{ pageContent: currentPage, messageId },
			balance.amount,
			existingRecipientAddress,
		)

		await editMessage(ctx, withdrawPage)
		return
	}

	await editMessage(ctx, ChooseWithdrawAmountPage.render(balance))
}
