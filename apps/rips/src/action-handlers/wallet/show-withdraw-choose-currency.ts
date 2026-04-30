import { currencyControllerGetCurrencies } from '../../../generated/api-client'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { WithdrawChooseCurrencyPage } from '../../pages/wallet/withdraw-choose-currency-page'
import { Effect, EffectType, SessionData } from '../../types'
import { toCurrencyId } from '../../utils/currency'
import { setFlow } from '../../utils/session-utils'
import { parseChain } from '../../validation/chain-index'

export async function showWithdrawChooseCurrency(
	session: SessionData,
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

	setFlow(session, 'withdraw', 'chain-chosen', { chain })

	return {
		type: EffectType.EDIT,
		page: WithdrawChooseCurrencyPage.render(data.currencies),
	}
}
