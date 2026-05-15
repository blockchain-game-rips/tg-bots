import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { assertFlow } from '../../grammy-kit/session/session-utils'
import { WithdrawChooseAmountPage } from '../../pages/wallet/withdraw-choose-amount-page'
import { EffectType } from '../../types'
import { fetchSingleBalance } from '../../utils/api/wrappers'
import { toCurrencyId } from '../../utils/currency'

export const openWithdrawChooseAmount: ActionDef<void> = noPayload(
	async (session) => {
		assertFlow(session, 'withdraw', 'currency-chosen')

		const { currency } = session.flow.data

		const currencyBalance = await fetchSingleBalance(
			session.telegramId,
			toCurrencyId(currency.chainAddress),
		)

		return {
			type: EffectType.EDIT,
			page: WithdrawChooseAmountPage.render(currencyBalance),
		}
	},
)
