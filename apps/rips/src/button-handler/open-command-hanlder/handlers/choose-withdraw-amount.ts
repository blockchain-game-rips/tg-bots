import { Filter } from 'grammy'
import { getBalance } from '../../../api/endpoints/wallets'
import { enterChoosingAddressStep } from '../../../flows/withdraw'
import {
	ChooseWithdrawAmountPage,
	MAX_AMOUNT_PAYLOAD,
} from '../../../pages/content/choose-withdraw-amount-page'
import { Context } from '../../../types'
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

	if (payload === MAX_AMOUNT_PAYLOAD) {
		const balance = await getBalance(telegramId)
		const availableBalance = calcAvailableBalance(BigInt(balance.amount))

		const currentPage = getCurrentPage(ctx)
		const messageId = ctx.update.callback_query.message!.message_id

		await enterChoosingAddressStep(ctx, availableBalance.toString(), {
			pageContent: currentPage,
			messageId,
		})

		return
	}

	const balance = await getBalance(telegramId)
	const chooseWithdrawAmountPage = ChooseWithdrawAmountPage.render(balance)

	await editMessage(ctx, chooseWithdrawAmountPage)
}
