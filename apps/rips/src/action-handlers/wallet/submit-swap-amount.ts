import { Effect, SessionData } from '../../types'
import { ErrorToRender } from '../../utils/error-to-render'
import { assertFlow } from '../../utils/session-utils'
import { resolveSwapPage } from '../../utils/swap'
import { parseCurrencyAmount } from '../../validation/amount'

export async function submitSwapAmount(
	session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	assertFlow(session, 'swap', 'idle')

	const { currencyIn, currencyOut } = session.flow.data

	if (currencyIn === undefined)
		throw new ErrorToRender('Select token in first')

	const parsed = parseCurrencyAmount(payload, currencyIn)

	return resolveSwapPage(session, {
		currencyIn,
		currencyOut,
		amountIn: BigInt(parsed.amount),
	})
}
