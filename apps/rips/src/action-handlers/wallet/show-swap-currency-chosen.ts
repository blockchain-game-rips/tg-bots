import { walletsControllerGetBalances } from '../../../generated/api-client'
import { Effect, SessionData } from '../../types'
import { rescaleAmount, toCurrencyId } from '../../utils/currency'
import { assertFlow } from '../../utils/session-utils'
import { resolveSwapPage, SwapState } from '../../utils/swap'
import { parseSelectingWithCurrency } from '../../validation/swap-selecting-with-index'

export async function showSwapCurrencyChosen(
	session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	assertFlow(session, 'swap', 'idle')

	const { selecting, value: currencyChainAddress } =
		parseSelectingWithCurrency(payload)

	const { data: balancesData } = await walletsControllerGetBalances({
		headers: { 'x-telegram-id': session.telegramId },
		query: { chainAddress: [toCurrencyId(currencyChainAddress)] },
	})

	const newCurrency = balancesData.balances[0].currency

	const { currencyIn, currencyOut, amountIn } = session.flow.data

	let state: SwapState

	if (selecting === 'in') {
		let newAmountIn = amountIn

		if (amountIn !== undefined && currencyIn !== undefined) {
			newAmountIn = rescaleAmount(
				amountIn,
				currencyIn.decimals,
				newCurrency.decimals,
			)
		}

		state = { currencyIn: newCurrency, currencyOut, amountIn: newAmountIn }
	} else {
		state = { currencyIn, currencyOut: newCurrency, amountIn }
	}

	return resolveSwapPage(session, state)
}
