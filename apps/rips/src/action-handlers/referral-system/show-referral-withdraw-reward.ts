import { referralSystemControllerWithdrawReward } from '../../../generated/api-client'
import { NATIVE_ON_BASE } from '../../constants'
import { WithdrawRewardSuccessPage } from '../../pages/content/referral-system/withdraw-reward-success-page'
import { Effect, EffectType, SessionData } from '../../types'

export async function showReferralWithdrawReward(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const { data } = await referralSystemControllerWithdrawReward({
		headers: { 'x-telegram-id': session.telegramId },
		body: { currencyAddress: NATIVE_ON_BASE.address },
	})

	return {
		type: EffectType.EDIT,
		page: WithdrawRewardSuccessPage.render(data),
	}
}
