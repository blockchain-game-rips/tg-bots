import {
	referralSystemControllerGetReferrer,
	referralSystemControllerQuoteWithdrawReward,
} from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { NATIVE_ON_BASE } from '../../constants'
import { toReset } from '../../flows'
import {
	findNativeOnBase,
	hasClaimableReward,
} from '../../domain/referral-reward'
import { ClaimRewardPage } from '../../pages/referral-system/claim-reward-page'
import { EffectType, PageContent } from '../../types'
import { balanceCache } from '../../cache/balance-cache'
import { openReferral } from './open-referral'
import { userApiKey } from '../../utils/api/key'

export const openReferralWithdrawReward: ActionDef<void> = noPayload(
	async (session) => {
		const page = await renderClaimRewardPage(session.telegramId)

		// The claim button is hidden at zero rewards, but a stale keyboard from
		// an older message can still reach this handler.
		if (page === null) return openReferral.handler(session)

		return {
			flow: toReset(),
			effect: {
				type: EffectType.NAVIGATE,
				page,
			},
		}
	},
)

/** Null when there is nothing left to claim, so there is no page to show. */
export async function renderClaimRewardPage(
	telegramId: number,
): Promise<PageContent | null> {
	const headers = {
		'x-telegram-id': telegramId.toString(),
		'x-user-key': userApiKey(),
	}

	const [{ data: referrerData }, { data: quote }, nativeBalance] =
		await Promise.all([
			referralSystemControllerGetReferrer({ headers }),
			referralSystemControllerQuoteWithdrawReward({
				headers,
				body: { currencyAddress: NATIVE_ON_BASE.address },
			}),
			balanceCache.getOne(telegramId, NATIVE_ON_BASE),
		])

	const state = findNativeOnBase(referrerData.states, 'referrer state')

	if (!hasClaimableReward(state)) return null

	return ClaimRewardPage.render({
		reward: {
			amount: state.rewards.available,
			currency: state.currency,
		},
		nativeBalance,
		blockchainFee: quote.blockchainFee,
	})
}
