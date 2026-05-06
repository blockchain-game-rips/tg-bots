import { ActionDef, withPayload } from '../../action-def'
import { assertFlow } from '../../utils/session-utils'
import { resolveWithdrawPage } from '../../utils/wallet'
import { parseCurrencyAmount } from '../../validation/amount'

export const submitWithdrawAmount: ActionDef<string> = withPayload(
	(amount) => amount,
	(raw) => raw,
	async (session, amountRaw) => {
		assertFlow(session, 'withdraw', 'currency-chosen')

		const flowData = session.flow.data
		const currency = flowData.currency

		const amountToWithdraw = parseCurrencyAmount(amountRaw, currency)

		return resolveWithdrawPage(
			session.telegramId,
			currency,
			amountToWithdraw,
			flowData.recipientAddress,
		)
	},
)
