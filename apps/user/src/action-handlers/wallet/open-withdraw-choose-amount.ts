import { assertFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { balanceCache } from '../../cache/balance-cache'
import { toHold } from '../../flows'
import { WithdrawChooseAmountPage } from '../../pages/wallet/withdraw-choose-amount-page'
import { EffectType } from '../../types'

export const openWithdrawChooseAmount: ActionDef<void> = noPayload(
	async (session) => {
		assertFlow(session, 'withdraw', 'withdraw-page')

		const currencyBalance = await balanceCache.getOne(
			session.telegramId,
			session.flow.data.chainAddress,
		)

		return {
			flow: toHold(),
			effect: {
				type: EffectType.NAVIGATE,
				page: WithdrawChooseAmountPage.render(currencyBalance),
			},
		}
	},
)
