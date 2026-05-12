import { ChainAddressDto } from '../../../generated/api-client'
import { ActionDef, withPayload } from '../../action-def'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { fetchBalances } from '../../utils/api'
import { toCurrencyId } from '../../utils/currency'
import { assertFlow } from '../../utils/session-utils'
import { resolveSwapPage, SwapState } from '../../utils/swap'
import { parseCurrencyChainAddress } from '../../validation/currency-index'

export const submitSwapCurrencyOut: ActionDef<ChainAddressDto> = withPayload(
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
