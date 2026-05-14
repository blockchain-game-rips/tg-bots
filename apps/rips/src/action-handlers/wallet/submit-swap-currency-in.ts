import { ChainAddressDto } from '../../../generated/api-client'
import { ActionDef, withPayload } from '../../action-def'
import { fetchBalances } from '../../utils/api'
import {
	findCurrencyIndex,
	rescaleAmount,
	toCurrencyId,
} from '../../utils/currency'
import { assertFlow } from '../../utils/session-utils'
import { resolveSwapPage, SwapState } from '../../utils/swap'
import { parseCurrencyChainAddress } from '../../validation/currency-index'

export const submitSwapCurrencyIn: ActionDef<ChainAddressDto> = withPayload(
	(value) => findCurrencyIndex(value).toString(),
	(raw) => parseCurrencyChainAddress(raw),
	async (session, currencyChainAddress) => {
		assertFlow(session, 'swap', 'idle')

		const balances = await fetchBalances(session.telegramId, [
			toCurrencyId(currencyChainAddress),
		])

		const balance = balances[0]

		if (balance === undefined) throw new Error('Balance not found')

		const newCurrency = balance.currency

		const { currencyIn, currencyOut, amountIn } = session.flow.data

		let newAmountIn = amountIn

		if (amountIn !== undefined && currencyIn !== undefined) {
			newAmountIn = rescaleAmount(
				amountIn,
				currencyIn.decimals,
				newCurrency.decimals,
			)
		}

		const state: SwapState = {
			currencyIn: newCurrency,
			currencyOut,
			amountIn: newAmountIn,
		}

		return resolveSwapPage(session, state)
	},
)
