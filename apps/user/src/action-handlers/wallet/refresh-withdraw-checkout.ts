import { assertFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { toStep } from '../../flows'
import { resolveWithdrawPage } from '../../utils/wallet'

export const refreshWithdrawCheckout: ActionDef<void> = noPayload(
	async (session) => {
		assertFlow(session, 'withdraw', 'currency-chosen')

		const { currency, amount, recipientAddress } = session.flow.data

		const flow = toStep(session.flow, 'currency-chosen', {
			currency,
			amount,
			recipientAddress,
		})

		const effect = await resolveWithdrawPage(
			session.telegramId,
			currency,
			amount,
			recipientAddress,
		)

		return { flow, effect }
	},
)
