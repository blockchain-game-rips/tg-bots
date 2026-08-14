import { referralSystemControllerWithdrawReward } from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { balanceCache } from '../../cache/balance-cache'
import { NATIVE_ON_BASE } from '../../constants'
import { toReset } from '../../flows'
import { WithdrawRewardSuccessPage } from '../../pages/referral-system/withdraw-reward-success-page'
import { EffectType } from '../../types'

export const executeReferralWithdrawReward: ActionDef<void> = noPayload(
	async (session) => {
		const { data } = await referralSystemControllerWithdrawReward({
			headers: { 'x-telegram-id': session.telegramId },
			body: { currencyAddress: NATIVE_ON_BASE.address },
		})

		await balanceCache.invalidate(session.telegramId, [NATIVE_ON_BASE])

		return {
			flow: toReset(),
			effect: {
				type: EffectType.NAVIGATE,
				page: WithdrawRewardSuccessPage.render(data),
			},
		}
	},
)
