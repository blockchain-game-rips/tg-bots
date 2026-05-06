import {
	ChainAddressDto,
	walletsControllerGetBalances,
} from '../../../generated/api-client'
import { ActionDef, withPayload } from '../../action-def'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { rescaleAmount, toCurrencyId } from '../../utils/currency'
import { assertFlow } from '../../utils/session-utils'
import { resolveSwapPage, SwapState } from '../../utils/swap'
import {
	encodeSelectingWithIndex,
	parseSelectingWithCurrency,
	SelectingWithValue,
} from '../../validation/swap-selecting-with-index'

export const submitSwapCurrency: ActionDef<
	SelectingWithValue<ChainAddressDto>
> = withPayload(
	({ selecting, value }) =>
		encodeSelectingWithIndex(
			selecting,
			SUPPORTED_CURRENCIES.findIndex(
				(c) =>
					c.address === value.address &&
					c.chain.reference === value.chain.reference,
			),
		),
	(raw) => parseSelectingWithCurrency(raw),
	async (session, { selecting, value: currencyChainAddress }) => {
		assertFlow(session, 'swap', 'idle')

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

			state = {
				currencyIn: newCurrency,
				currencyOut,
				amountIn: newAmountIn,
			}
		} else {
			state = { currencyIn, currencyOut: newCurrency, amountIn }
		}

		return resolveSwapPage(session, state)
	},
)
