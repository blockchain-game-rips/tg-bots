import { referralSystemControllerGetTierTables } from '../../generated/api-client'
import { ReferralAboutPage } from '../pages/content/referral-system/referral-about-page'
import { Effect, EffectType, SessionData } from '../types'

export async function showReferralAbout(
	_session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const { data: tierTables } = await referralSystemControllerGetTierTables({
		throwOnError: true,
	})

	return {
		type: EffectType.EDIT,
		page: ReferralAboutPage.render(tierTables),
	}
}
