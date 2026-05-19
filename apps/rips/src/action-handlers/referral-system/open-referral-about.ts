import { referralSystemControllerGetTierTables } from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { ReferralAboutPage } from '../../pages/referral-system/referral-about-page'
import { EffectType } from '../../types'

export const openReferralAbout: ActionDef<void> = noPayload(async () => {
	const { data: tierTables } = await referralSystemControllerGetTierTables()

	return {
		type: EffectType.EDIT,
		page: ReferralAboutPage.render(tierTables),
	}
})
