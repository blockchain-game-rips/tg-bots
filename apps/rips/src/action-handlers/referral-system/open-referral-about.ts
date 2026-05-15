import { referralSystemControllerGetTierTables } from '../../../generated/api-client'
import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { ReferralAboutPage } from '../../pages/referral-system/referral-about-page'
import { EffectType } from '../../types'

export const openReferralAbout: ActionDef<void> = noPayload(async () => {
	const { data: tierTables } = await referralSystemControllerGetTierTables()

	return {
		type: EffectType.EDIT,
		page: ReferralAboutPage.render(tierTables),
	}
})
