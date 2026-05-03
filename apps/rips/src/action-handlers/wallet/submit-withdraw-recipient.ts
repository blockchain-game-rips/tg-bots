import { Effect, SessionData } from '../../types'
import { toCurrencyAmount } from '../../utils/currency'
import { assertFlow } from '../../utils/session-utils'
import { resolveWithdrawPage } from '../../utils/wallet'
import { parseEvmAddress } from '../../validation/evm-address'

export async function submitWithdrawRecipient(
	session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	assertFlow(session, 'withdraw', 'currency-chosen')

	const flowData = session.flow.data
	const currency = flowData.currency

	const recipientAddress = parseEvmAddress(payload)

	const amount = flowData.amount
	const currencyAmount =
		amount === undefined ? undefined : toCurrencyAmount(amount, currency)

	return resolveWithdrawPage(
		session.telegramId,
		currency,
		currencyAmount,
		recipientAddress,
	)
}
