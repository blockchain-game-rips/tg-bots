import { walletsControllerGetBalances } from '../../../generated/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { WithdrawChooseAmountPage } from '../../pages/wallet/withdraw-choose-amount-page'
import { EffectType } from '../../types'
import { toCurrencyId } from '../../utils/currency'
import { assertFlow } from '../../utils/session-utils'

export const openWithdrawChooseAmount: ActionDef<void> = noPayload(
	async (session) => {
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
	},
)
