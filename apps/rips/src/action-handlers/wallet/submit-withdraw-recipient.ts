import { ActionDef, withPayload } from '../../action-def'
import { toCurrencyAmount } from '../../utils/currency'
import { assertFlow } from '../../utils/session-utils'
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

		return resolveWithdrawPage(
			session.telegramId,
			currency,
			currencyAmount,
			recipientAddress,
		)
	},
)
