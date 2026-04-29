import {
	ChooseWithdrawAmountPage,
	MAX_AMOUNT_PAYLOAD,
} from '../../pages/wallet/choose-withdraw-amount-page'
import { WithdrawPage } from '../../pages/wallet/withdraw-page'
import { Effect, EffectType, SessionData } from '../../types'
import { fetchNativeBalance } from '../../utils/api'

export async function showChooseWithdrawAmount(
	session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	const { telegramId } = session
	const balance = await fetchNativeBalance(telegramId)

	if (payload === MAX_AMOUNT_PAYLOAD) {
		const existingData =
			session.flow?.flowType === 'withdraw'
				? session.flow.data
				: undefined

		session.flow = {
			flowType: 'withdraw',
			step: 'on-withdraw-page',
			data: {
				...existingData,
				amount: balance.amount,
			},
		}

		return {
			type: EffectType.EDIT,
			page: WithdrawPage.render(
				balance,
				balance.amount,
				existingData?.recipientAddress,
			),
		}
	}

	return {
		type: EffectType.EDIT,
		page: ChooseWithdrawAmountPage.render(balance),
	}
}
