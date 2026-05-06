import { ActionDef, withPayload } from '../../action-def'
import { SUPPORTED_CHAINS, SUPPORTED_CURRENCIES } from '../../constants'
import { SwapChooseTokenPage } from '../../pages/wallet/swap-choose-token'
import { Chain, EffectType } from '../../types'
import { fetchCurrencies } from '../../utils/api'
import { toCurrencyId } from '../../utils/currency'
import {
	encodeSelectingWithIndex,
	parseSelectingWithChain,
	SelectingWithValue,
} from '../../validation/swap-selecting-with-index'

export const openSwapChooseToken: ActionDef<SelectingWithValue<Chain>> =
	withPayload(
		({ selecting, value: chain }) =>
			encodeSelectingWithIndex(
				selecting,
				SUPPORTED_CHAINS.findIndex(
					(c) =>
						c.namespace === chain.namespace &&
						c.reference === chain.reference,
				),
			),
		(raw) => parseSelectingWithChain(raw),
		async (_session, { selecting, value: chain }) => {
			const chainCurrencyIds = SUPPORTED_CURRENCIES.filter(
				(c) =>
					c.chain.namespace === chain.namespace &&
					c.chain.reference === chain.reference,
			).map(toCurrencyId)

			const currencies = await fetchCurrencies(chainCurrencyIds)

			return {
				type: EffectType.EDIT,
				page: SwapChooseTokenPage.render(currencies, selecting),
			}
		},
	)
