import { Filter } from 'grammy'
import { getMainCurrencyPrice } from '../../../api/endpoints/price'
import { getBalance } from '../../../api/endpoints/wallets'
import { enterWithdrawPage } from '../../../flows/withdraw'
import {
	ChooseWithdrawAmountPage,
	MAX_AMOUNT_PAYLOAD,
} from '../../../pages/content/choose-withdraw-amount-page'
import { ActiveFlow, Context, WithdrawStep } from '../../../types'
import { editMessage } from '../../../utils/grammy'
import { calcAvailableBalance } from '../../../utils/tx'
import { getCurrentPage } from '../../utils'

export async function handleChooseWithdrawAmountPageId(
	ctx: Filter<Context, 'callback_query:data'>,
	payloads: string[],
) {
	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = BigInt(ctx.from.id)
	const payload = payloads[0]
	const currentPage = getCurrentPage(ctx)
	const messageId = ctx.update.callback_query.message!.message_id

	const session = ctx.session
	const existingRecipientAddress =
		session.activeFlow === ActiveFlow.Withdraw &&
		session.step === WithdrawStep.OnWithdrawPage
			? session.recipientAddress
			: undefined

	if (payload === MAX_AMOUNT_PAYLOAD) {
		const [balance, { price }] = await Promise.all([
			getBalance(telegramId),
			getMainCurrencyPrice(),
		])
		const availableBalance = calcAvailableBalance(BigInt(balance.amount))

		const withdrawPage = await enterWithdrawPage(
			ctx,
			{ pageContent: currentPage, messageId },
			price,
			availableBalance.toString(),
			existingRecipientAddress,
		)

		await editMessage(ctx, withdrawPage)
		return
	}

	const [balance, { price }] = await Promise.all([
		getBalance(telegramId),
		getMainCurrencyPrice(),
	])
	const chooseWithdrawAmountPage = ChooseWithdrawAmountPage.render(
		balance,
		price,
	)

	await editMessage(ctx, chooseWithdrawAmountPage)
}
