import { ActionDef, noPayload } from '../../action-def'
import { WithdrawChooseAmountPage } from '../../pages/wallet/withdraw-choose-amount-page'
import { EffectType } from '../../types'
import { fetchBalances } from '../../utils/api'
import { toCurrencyId } from '../../utils/currency'
import { assertFlow } from '../../utils/session-utils'

export const openWithdrawChooseAmount: ActionDef<void> = noPayload(
	async (session) => {
		assertFlow(session, 'withdraw', 'currency-chosen')

		const { currency } = session.flow.data

		const balances = await fetchBalances(session.telegramId, [
			toCurrencyId(currency.chainAddress),
		])

		const currencyBalance = balances[0]

		if (currencyBalance === undefined) throw new Error('Balance not found')

		return {
			type: EffectType.EDIT,
			page: WithdrawChooseAmountPage.render(currencyBalance),
		}
	},
)
