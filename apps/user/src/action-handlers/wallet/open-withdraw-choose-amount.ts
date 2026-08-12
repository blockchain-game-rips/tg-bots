import { assertFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { toHold } from '../../flows'
import { WithdrawChooseAmountPage } from '../../pages/wallet/withdraw-choose-amount-page'
import { EffectType } from '../../types'

export const openWithdrawChooseAmount: ActionDef<void> = noPayload(
	(session) => {
		assertFlow(session, 'withdraw', 'withdraw-page')

		const { currencyBalance } = session.flow.data

		return {
			flow: toHold(),
			effect: {
				type: EffectType.NAVIGATE,
				page: WithdrawChooseAmountPage.render(currencyBalance),
			},
		}
	},
)
