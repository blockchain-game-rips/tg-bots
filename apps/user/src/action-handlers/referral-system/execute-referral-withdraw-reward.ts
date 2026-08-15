import { referralSystemControllerWithdrawReward } from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { balanceCache } from '../../cache/balance-cache'
import { NATIVE_ON_BASE } from '../../constants'
import { toReset } from '../../flows'
import { WithdrawRewardSuccessPage } from '../../pages/referral-system/withdraw-reward-success-page'
import { EffectType } from '../../types'
import { callOrUnknown } from '../../utils/api/call-or-unknown'
import { errorOnFreshPage } from '../../utils/display/error-on-fresh-page'
import {
	claimNouns,
	unknownMessage,
} from '../../utils/display/transaction-outcome-copy'
import { failureMessage } from '../../utils/display/transaction-status'
import { renderClaimRewardPage } from './open-referral-withdraw-reward'

export const executeReferralWithdrawReward: ActionDef<void> = noPayload(
	async (session) => {
		const response = await callOrUnknown(() =>
			referralSystemControllerWithdrawReward({
				headers: { 'x-telegram-id': session.telegramId },
				body: { currencyAddress: NATIVE_ON_BASE.address },
			}),
		)

		await balanceCache.invalidate(session.telegramId, [NATIVE_ON_BASE])

		if (response === null) {
			throw await toClaimError(
				session.telegramId,
				unknownMessage(claimNouns),
			)
		}

		const { withdrawal } = response.data

		if (withdrawal.status !== 'succeeded') {
			throw await toClaimError(
				session.telegramId,
				failureMessage(withdrawal, claimNouns),
			)
		}

		return {
			flow: toReset(),
			effect: {
				type: EffectType.NAVIGATE,
				page: WithdrawRewardSuccessPage.render({
					amount: withdrawal.result,
					transaction: withdrawal.transaction,
				}),
				history: { kind: 'page' },
			},
		}
	},
)

function toClaimError(telegramId: string, message: string) {
	return errorOnFreshPage(() => renderClaimRewardPage(telegramId), message)
}
