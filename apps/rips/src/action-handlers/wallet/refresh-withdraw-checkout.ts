import { assertFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { toCurrencyAmount } from '../../utils/currency'
import { resolveWithdrawPage } from '../../utils/wallet'

export const refreshWithdrawCheckout: ActionDef<void> = noPayload(
	async (session) => {
		assertFlow(session, 'withdraw', 'currency-chosen')

		const { currency, amount, recipientAddress } = session.flow.data

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
