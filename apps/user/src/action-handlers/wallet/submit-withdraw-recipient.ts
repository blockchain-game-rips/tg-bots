import { assertFlow } from '@rips/grammy-kit'
import { parseEvmAddress } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { toStep } from '../../flows'
import { resolveWithdrawPage } from '../../utils/wallet'

export const submitWithdrawRecipient: ActionDef<string> = withPayload(
	{
		encode: (address) => address,
		decode: (raw) => parseEvmAddress(raw),
	},
	async (session, recipientAddress) => {
		assertFlow(session, 'withdraw', 'currency-chosen')

		const flowData = session.flow.data
		const currency = flowData.currency
		const flow = toStep(session.flow, 'currency-chosen', {
			currency: flowData.currency,
			amount: flowData.amount,
			recipientAddress,
		})

		const effect = await resolveWithdrawPage(
			session.telegramId,
			currency,
			flowData.amount,
			recipientAddress,
		)

		return { flow, effect }
	},
)
