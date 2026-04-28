import { WithdrawPage } from '../pages/content/wallet/withdraw-page'
import { Effect, EffectType, SessionData } from '../types'
import { fetchNativeBalance } from '../utils/units'
import { parseEvmAddress } from '../validation/evm-address'

export async function submitWithdrawRecipient(
	session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	const recipientAddress = parseEvmAddress(payload)

	const { telegramId } = session
	const balance = await fetchNativeBalance(telegramId)

	const existingAmount =
		session.flow?.flowType === 'withdraw'
			? session.flow.data.amount
			: undefined

	session.flow = {
		flowType: 'withdraw',
		step: 'on-withdraw-page',
		data: { amount: existingAmount, recipientAddress },
	}

	return {
		type: EffectType.EDIT,
		page: WithdrawPage.render(balance, existingAmount, recipientAddress),
	}
}
