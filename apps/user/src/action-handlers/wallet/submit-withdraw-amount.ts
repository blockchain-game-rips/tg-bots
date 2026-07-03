import { assertFlow, toStep } from '@rips/grammy-kit'
import { parseCurrencyAmount } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { resolveWithdrawPage } from '../../utils/wallet'

export const submitWithdrawAmount: ActionDef<string> = withPayload(
	(amount) => amount,
	(raw) => raw,
	async (session, amountRaw) => {
		assertFlow(session, 'withdraw', 'currency-chosen')

		const flowData = session.flow.data
		const currency = flowData.currency

		const amountToWithdraw = parseCurrencyAmount(amountRaw, currency)

		const flow = toStep(session.flow, 'currency-chosen', {
			currency: flowData.currency,
			amount: BigInt(amountToWithdraw.amount),
			recipientAddress: flowData.recipientAddress,
		})

		const effect = await resolveWithdrawPage(
			session.telegramId,
			currency,
			amountToWithdraw,
			flowData.recipientAddress,
		)

		return { flow, effect }
	},
)
