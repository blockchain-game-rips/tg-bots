import { ActionDef, withPayload } from '../../grammy-kit/action/action-def'
import { assertFlow, setFlowStep } from '../../grammy-kit/session/session-utils'
import { toCurrencyAmount } from '../../utils/currency'
import { resolveWithdrawPage } from '../../utils/wallet'
import { parseEvmAddress } from '../../validation/evm-address'

export const submitWithdrawRecipient: ActionDef<string> = withPayload(
	(address) => address,
	(raw) => parseEvmAddress(raw),
	async (session, recipientAddress) => {
		assertFlow(session, 'withdraw', 'currency-chosen')

		const flowData = session.flow.data
		const currency = flowData.currency
		const amount = flowData.amount
		const currencyAmount =
			amount === undefined
				? undefined
				: toCurrencyAmount(amount, currency)

		setFlowStep(session, 'currency-chosen', {
			currency: flowData.currency,
			amount: flowData.amount,
			recipientAddress,
		})

		return resolveWithdrawPage(
			session.telegramId,
			currency,
			currencyAmount,
			recipientAddress,
		)
	},
)
