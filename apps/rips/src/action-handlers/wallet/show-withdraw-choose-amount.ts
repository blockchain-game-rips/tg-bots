import { walletsControllerGetBalances } from '../../../generated/api-client'
import { WithdrawChooseAmountPage } from '../../pages/wallet/withdraw-choose-amount-page'
import { EffectEdit, EffectType, SessionData } from '../../types'
import { toCurrencyId } from '../../utils/currency'
import { assertFlow } from '../../utils/session-utils'

export async function showWithdrawChooseAmount(
	session: SessionData,
	_payload: string | undefined,
): Promise<EffectEdit> {
	assertFlow(session, 'withdraw', 'currency-chosen')

	const { currency } = session.flow.data

	const { data: balancesData } = await walletsControllerGetBalances({
		headers: { 'x-telegram-id': session.telegramId },
		query: { chainAddress: [toCurrencyId(currency.chainAddress)] },
	})

	const currencyBalance = balancesData.balances[0]

	return {
		type: EffectType.EDIT,
		page: WithdrawChooseAmountPage.render(currencyBalance),
	}
}
