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
import { EffectType } from '../../types'
import { fetchNativeBalance } from '../../utils/api/wrappers'
import { openReferral } from './open-referral'

export const openReferralWithdrawReward: ActionDef<void> = noPayload(
	async (session) => {
		const { telegramId } = session

		const headers = { 'x-telegram-id': telegramId }

		const [{ data: referrerData }, { data: quote }, nativeBalance] =
			await Promise.all([
				referralSystemControllerGetReferrer({ headers }),
				referralSystemControllerQuoteWithdrawReward({
					headers,
					body: { currencyAddress: NATIVE_ON_BASE.address },
				}),
				fetchNativeBalance(telegramId),
			])

		const state = findNativeOnBase(referrerData.states, 'referrer state')

		// The claim button is hidden at zero rewards, but a stale keyboard from
		// an older message can still reach this handler.
		if (!hasClaimableReward(state)) return openReferral.handler(session)

		return {
			flow: toReset(),
			effect: {
				type: EffectType.EDIT,
				page: ClaimRewardPage.render({
					reward: {
						amount: state.rewards.available,
						currency: state.currency,
					},
					nativeBalance,
					blockchainFee: quote.blockchainFee,
				}),
			},
		}
	},
)
