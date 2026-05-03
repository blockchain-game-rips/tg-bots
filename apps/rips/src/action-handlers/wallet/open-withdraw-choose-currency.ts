import { currencyControllerGetCurrencies } from '../../../generated/api-client'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { WithdrawChooseCurrencyPage } from '../../pages/wallet/withdraw-choose-currency-page'
import { Effect, EffectType, SessionData } from '../../types'
import { toCurrencyId } from '../../utils/currency'
import { parseChain } from '../../validation/chain-index'

export async function openWithdrawChooseCurrency(
	_session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	const chain = parseChain(payload)

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
		page: WithdrawChooseCurrencyPage.render(data.currencies),
	}
}
