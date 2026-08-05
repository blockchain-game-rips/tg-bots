import { assertFlow } from '@rips/grammy-kit'
import { parseCurrencyAmount } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { toStep } from '../../flows'
import { rawStringCodec } from '../../utils/codecs'
import { resolveWithdrawPage } from '../../utils/wallet'

export const submitWithdrawAmount: ActionDef<string> = withPayload(
	rawStringCodec,
	async (session, amountRaw) => {
		assertFlow(session, 'withdraw', 'currency-chosen')

		const flowData = session.flow.data
		const currency = flowData.currency

		const amountToWithdraw = parseCurrencyAmount(amountRaw, currency)

		const amount = BigInt(amountToWithdraw.amount)

		const flow = toStep(session.flow, 'currency-chosen', {
			currency: flowData.currency,
			amount,
			recipientAddress: flowData.recipientAddress,
		})

		const effect = await resolveWithdrawPage(
			session.telegramId,
			currency,
			amount,
			flowData.recipientAddress,
		)

		return { flow, effect }
	},
)
