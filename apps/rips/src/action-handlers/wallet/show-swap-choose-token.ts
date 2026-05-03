import { currencyControllerGetCurrencies } from '../../../generated/api-client'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { SwapChooseTokenPage } from '../../pages/wallet/swap-choose-token'
import { Effect, EffectType, SessionData } from '../../types'
import { toCurrencyId } from '../../utils/currency'
import { parseSelectingWithChain } from '../../validation/swap-selecting-with-index'

export async function showSwapChooseToken(
	_session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	const { selecting, value: chain } = parseSelectingWithChain(payload)

	const chainCurrencyIds = SUPPORTED_CURRENCIES.filter(
		(c) =>
			c.chain.namespace === chain.namespace &&
			c.chain.reference === chain.reference,
	).map(toCurrencyId)

	const { data } = await currencyControllerGetCurrencies({
		query: { chainAddress: chainCurrencyIds },
	})

	return {
		type: EffectType.EDIT,
		page: SwapChooseTokenPage.render(data.currencies, selecting),
	}
}
