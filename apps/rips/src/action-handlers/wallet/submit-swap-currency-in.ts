import { ChainAddressDto } from '../../../generated/api-client'
import { ActionDef, withPayload } from '../../action-def'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { fetchBalances } from '../../utils/api'
import { rescaleAmount, toCurrencyId } from '../../utils/currency'
import { assertFlow } from '../../utils/session-utils'
import { resolveSwapPage, SwapState } from '../../utils/swap'
import { parseCurrencyChainAddress } from '../../validation/currency-index'

export const submitSwapCurrencyIn: ActionDef<ChainAddressDto> = withPayload(
	(value) =>
		SUPPORTED_CURRENCIES.findIndex(
			(c) =>
				c.address === value.address &&
				c.chain.reference === value.chain.reference,
		).toString(),
	(raw) => parseCurrencyChainAddress(raw),
	async (session, currencyChainAddress) => {
		assertFlow(session, 'swap', 'idle')

		const balances = await fetchBalances(session.telegramId, [
			toCurrencyId(currencyChainAddress),
		])

		const newCurrency = balances[0].currency

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
