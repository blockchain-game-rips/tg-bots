import { ActionDef, withPayload } from '../../grammy-kit/action/action-def'
import { assertFlow, setFlowStep } from '../../grammy-kit/session/session-utils'
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

		setFlowStep(session, 'currency-chosen', {
			currency: flowData.currency,
			amount: BigInt(amountToWithdraw.amount),
			recipientAddress: flowData.recipientAddress,
		})

		return resolveWithdrawPage(
			session.telegramId,
			currency,
			amountToWithdraw,
			flowData.recipientAddress,
		)
	},
)
