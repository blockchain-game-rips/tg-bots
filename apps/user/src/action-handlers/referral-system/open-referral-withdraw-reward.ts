import { referralSystemControllerWithdrawReward } from '@rips/api-client'
import { toReset } from '@rips/grammy-kit'
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
			flow: toReset(),
			effect: {
				type: EffectType.EDIT,
				page: WithdrawRewardSuccessPage.render(data),
			},
		}
	},
)
