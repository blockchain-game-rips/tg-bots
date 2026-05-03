import { Effect, SessionData } from '../../types'
import { assertFlow } from '../../utils/session-utils'
import { resolveWithdrawPage } from '../../utils/wallet'
import { parseCurrencyAmount } from '../../validation/amount'

export async function submitWithdrawAmount(
	session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	assertFlow(session, 'withdraw', 'currency-chosen')

	const flowData = session.flow.data
	const currency = flowData.currency

	const amountToWithdraw = parseCurrencyAmount(payload, currency)

	return resolveWithdrawPage(
		session.telegramId,
		currency,
		amountToWithdraw,
		flowData.recipientAddress,
	)
}
