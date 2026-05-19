import { assertFlow } from '@rips/grammy-kit'
import { ChainAddressDto } from '../../../generated/api-client'
import { ActionDef, withPayload } from '../../action-def'
import { fetchSingleBalance } from '../../utils/api/wrappers'
import { findCurrencyIndex, toCurrencyId } from '../../utils/currency'
import { resolveSwapPage, SwapState } from '../../utils/swap'
import { parseCurrencyChainAddress } from '../../validation/currency-index'

export const submitSwapCurrencyOut: ActionDef<ChainAddressDto> = withPayload(
	(value) => findCurrencyIndex(value).toString(),
	(raw) => parseCurrencyChainAddress(raw),
	async (session, currencyChainAddress) => {
		assertFlow(session, 'swap', 'idle')

		const balance = await fetchSingleBalance(
			session.telegramId,
			toCurrencyId(currencyChainAddress),
		)

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
