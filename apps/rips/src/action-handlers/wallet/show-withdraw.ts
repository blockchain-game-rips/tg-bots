import { walletsControllerGetBalances } from '../../../generated/api-client'
import { WithdrawPage } from '../../pages/wallet/withdraw-page'
import { EffectEdit, EffectType, SessionData } from '../../types'
import { toCurrencyId } from '../../utils/currency'
import { setFlow } from '../../utils/session-utils'
import { parseCurrencyChainAddress } from '../../validation/currency-index'

export async function showWithdraw(
	session: SessionData,
	payload: string | undefined,
): Promise<EffectEdit> {
	const currencyChainAddress = parseCurrencyChainAddress(payload)

	const { data: balancesData } = await walletsControllerGetBalances({
		headers: { 'x-telegram-id': session.telegramId },
		query: { chainAddress: [toCurrencyId(currencyChainAddress)] },
	})

	const currencyBalance = balancesData.balances[0]

	setFlow(session, 'withdraw', 'currency-chosen', {
		currency: currencyBalance.currency,
	})

	return {
		type: EffectType.EDIT,
		page: WithdrawPage.render(currencyBalance, undefined, undefined),
	}
}
