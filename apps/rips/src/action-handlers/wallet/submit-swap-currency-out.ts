import { ChainAddressDto } from '../../../generated/api-client'
import { ActionDef, withPayload } from '../../action-def'
import { fetchBalances } from '../../utils/api'
import { findCurrencyIndex, toCurrencyId } from '../../utils/currency'
import { assertFlow } from '../../utils/session-utils'
import { resolveSwapPage, SwapState } from '../../utils/swap'
import { parseCurrencyChainAddress } from '../../validation/currency-index'

export const submitSwapCurrencyOut: ActionDef<ChainAddressDto> = withPayload(
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

		const { currencyIn, amountIn } = session.flow.data

		const state: SwapState = {
			currencyIn,
			currencyOut: newCurrency,
			amountIn,
		}

		return resolveSwapPage(session, state)
	},
)
