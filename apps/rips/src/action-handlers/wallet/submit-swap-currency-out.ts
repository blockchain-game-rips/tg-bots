import { ChainAddressDto } from '@rips/api-client'
import { assertFlow, toHold } from '@rips/grammy-kit'
import { parseCurrencyChainAddress } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { fetchSingleBalance } from '../../utils/api/wrappers'
import { findCurrencyIndex, toCurrencyId } from '../../utils/currency'
import { resolveSwapPage, SwapState } from '../../utils/swap'

export const submitSwapCurrencyOut: ActionDef<ChainAddressDto> = withPayload(
	(value) => findCurrencyIndex(value).toString(),
	(raw) => parseCurrencyChainAddress(raw, SUPPORTED_CURRENCIES),
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

		const effect = await resolveSwapPage(session, state)

		return { flow: toHold(), effect }
	},
)
