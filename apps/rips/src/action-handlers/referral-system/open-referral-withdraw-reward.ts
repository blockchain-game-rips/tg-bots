import { referralSystemControllerWithdrawReward } from '../../../generated/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { NATIVE_ON_BASE } from '../../constants'
import { WithdrawRewardSuccessPage } from '../../pages/referral-system/withdraw-reward-success-page'
import { EffectType } from '../../types'

export const openReferralWithdrawReward: ActionDef<void> = noPayload(
	async (session) => {
		const { data } = await referralSystemControllerWithdrawReward({
			headers: { 'x-telegram-id': session.telegramId },
			body: { currencyAddress: NATIVE_ON_BASE.address },
		})

		return {
			type: EffectType.EDIT,
			page: WithdrawRewardSuccessPage.render(data),
		}
	},
)
