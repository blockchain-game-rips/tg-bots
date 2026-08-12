import { referralSystemControllerGetTierTables } from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { toReset } from '../../flows'
import { ReferralTiersPage } from '../../pages/referral-system/referral-tiers-page'
import { EffectType } from '../../types'

export const openReferralTiers: ActionDef<void> = noPayload(async () => {
	const { data: tierTables } = await referralSystemControllerGetTierTables()

	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page: ReferralTiersPage.render(tierTables),
		},
	}
})
