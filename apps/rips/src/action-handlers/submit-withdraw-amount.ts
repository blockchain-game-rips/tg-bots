import { WithdrawPage } from '../pages/content/wallet/withdraw-page'
import { Effect, EffectType, SessionData } from '../types'
import { fetchNativeBalance } from '../utils/units'
import { parseWithdrawAmount } from '../validation/withdraw-amount'

export async function submitWithdrawAmount(
	session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	const { telegramId } = session
	const balance = await fetchNativeBalance(telegramId)

	const amount = parseWithdrawAmount(
		payload,
		balance.currency.decimals,
		BigInt(balance.amount),
	)

	const existingRecipient =
		session.flow?.flowType === 'withdraw'
			? session.flow.data.recipientAddress
			: undefined

	session.flow = {
		flowType: 'withdraw',
		step: 'on-withdraw-page',
		data: { amount, recipientAddress: existingRecipient },
	}

	return {
		type: EffectType.EDIT,
		page: WithdrawPage.render(balance, amount, existingRecipient),
	}
}
