import { referralSystemControllerWithdrawReward } from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { balanceCache } from '../../cache/balance-cache'
import { NATIVE_ON_BASE } from '../../constants'
import { CLAIM_FRAME } from '../../domain/loading-frames'
import { Flow, toReset } from '../../flows'
import { WithdrawRewardSuccessPage } from '../../pages/referral-system/withdraw-reward-success-page'
import { EffectType, HandlerResult } from '../../types'
import { callOrUnknown } from '../../utils/api/call-or-unknown'
import { errorOnFreshPage } from '../../utils/display/error-on-fresh-page'
import {
	claimNouns,
	unknownMessage,
} from '../../utils/display/transaction-outcome-copy'
import { failureMessage } from '../../utils/display/transaction-status'
import { renderClaimRewardPage } from './open-referral-withdraw-reward'

export const executeReferralWithdrawReward: ActionDef<void> = noPayload(
	(session) => ({
		effect: {
			type: EffectType.LOADING,
			message: CLAIM_FRAME,
			next: () => executeClaimRequest(session.telegramId),
		},
	}),
)

async function executeClaimRequest(
	telegramId: string,
): Promise<HandlerResult<Flow>> {
	const response = await callOrUnknown(() =>
		referralSystemControllerWithdrawReward({
			headers: { 'x-telegram-id': telegramId },
			body: { currencyAddress: NATIVE_ON_BASE.address },
		}),
	)

	await balanceCache.invalidate(telegramId, [NATIVE_ON_BASE])

	if (response === null) {
		throw await toClaimError(telegramId, unknownMessage(claimNouns))
	}

	const { withdrawal } = response.data

	if (withdrawal.status !== 'succeeded') {
		throw await toClaimError(
			telegramId,
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
}

function toClaimError(telegramId: string, message: string) {
	return errorOnFreshPage(() => renderClaimRewardPage(telegramId), message)
}
