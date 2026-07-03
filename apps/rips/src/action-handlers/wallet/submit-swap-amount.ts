import { assertFlow, ErrorToRender, toHold } from '@rips/grammy-kit'
import { parseCurrencyAmount } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { resolveSwapPage } from '../../utils/swap'

export const submitSwapAmount: ActionDef<string> = withPayload(
	(amount) => amount,
	(raw) => raw,
	async (session, amountRaw) => {
		assertFlow(session, 'swap', 'idle')

		const { currencyIn, currencyOut } = session.flow.data

		if (currencyIn === undefined)
			throw new ErrorToRender('Select token in first')

		const parsed = parseCurrencyAmount(amountRaw, currencyIn)

		const effect = await resolveSwapPage(session, {
			currencyIn,
			currencyOut,
			amountIn: BigInt(parsed.amount),
		})

		return { flow: toHold(), effect }
	},
)
