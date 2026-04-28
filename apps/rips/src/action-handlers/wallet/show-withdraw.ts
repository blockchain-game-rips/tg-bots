import { WithdrawPage } from '../../pages/content/wallet/withdraw-page'
import { Effect, EffectType, SessionData } from '../../types'
import { fetchNativeBalance } from '../../utils/units'

export async function showWithdraw(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const { telegramId } = session

	const balance = await fetchNativeBalance(telegramId)

	const existingData =
		session.flow?.flowType === 'withdraw' ? session.flow.data : undefined

	session.flow = {
		flowType: 'withdraw',
		step: 'on-withdraw-page',
		data: existingData ?? {},
	}

	return {
		type: EffectType.EDIT,
		page: WithdrawPage.render(
			balance,
			existingData?.amount,
			existingData?.recipientAddress,
		),
	}
}
