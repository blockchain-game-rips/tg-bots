import { assertFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { toHold } from '../../flows'
import { WithdrawChooseAmountPage } from '../../pages/wallet/withdraw-choose-amount-page'
import { EffectType } from '../../types'
import { fetchSingleBalance } from '../../utils/api/wrappers'

export const openWithdrawChooseAmount: ActionDef<void> = noPayload(
	async (session) => {
		assertFlow(session, 'withdraw', 'currency-chosen')

		const { currency } = session.flow.data

		const currencyBalance = await fetchSingleBalance(
			session.telegramId,
			currency.chainAddress,
		)

		return {
			flow: toHold(),
			effect: {
				type: EffectType.EDIT,
				page: WithdrawChooseAmountPage.render(currencyBalance),
			},
		}
	},
)
