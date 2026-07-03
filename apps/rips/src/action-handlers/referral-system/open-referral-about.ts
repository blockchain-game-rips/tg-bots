import { referralSystemControllerGetTierTables } from '@rips/api-client'
import { toReset } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { ReferralAboutPage } from '../../pages/referral-system/referral-about-page'
import { EffectType } from '../../types'

export const openReferralAbout: ActionDef<void> = noPayload(async () => {
	const { data: tierTables } = await referralSystemControllerGetTierTables()

	return {
		flow: toReset(),
		effect: {
			type: EffectType.EDIT,
			page: ReferralAboutPage.render(tierTables),
		},
	}
})
