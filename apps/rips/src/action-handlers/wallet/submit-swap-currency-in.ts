import { assertFlow } from '@rips/grammy-kit'
import { ChainAddressDto } from '../../../generated/api-client'
import { ActionDef, withPayload } from '../../action-def'
import { fetchSingleBalance } from '../../utils/api/wrappers'
import {
	findCurrencyIndex,
	rescaleAmount,
	toCurrencyId,
} from '../../utils/currency'
import { resolveSwapPage, SwapState } from '../../utils/swap'
import { parseCurrencyChainAddress } from '../../validation/currency-index'

export const submitSwapCurrencyIn: ActionDef<ChainAddressDto> = withPayload(
	(value) => findCurrencyIndex(value).toString(),
	(raw) => parseCurrencyChainAddress(raw),
	async (session, currencyChainAddress) => {
		assertFlow(session, 'swap', 'idle')

		const balance = await fetchSingleBalance(
			session.telegramId,
			toCurrencyId(currencyChainAddress),
		)

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
