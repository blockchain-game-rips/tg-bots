import { ActionDef, withPayload } from '../../action-def'
import { ErrorToRender } from '../../utils/error-to-render'
import { assertFlow } from '../../utils/session-utils'
import { resolveSwapPage } from '../../utils/swap'
import { parseCurrencyAmount } from '../../validation/amount'

export const submitSwapAmount: ActionDef<string> = withPayload(
	(amount) => amount,
	(raw) => raw,
	async (session, amountRaw) => {
		assertFlow(session, 'swap', 'idle')

		const { currencyIn, currencyOut } = session.flow.data

		if (currencyIn === undefined)
			throw new ErrorToRender('Select token in first')

		const parsed = parseCurrencyAmount(amountRaw, currencyIn)

		return resolveSwapPage(session, {
			currencyIn,
			currencyOut,
			amountIn: BigInt(parsed.amount),
		})
	},
)
