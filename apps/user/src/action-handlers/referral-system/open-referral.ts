import {
	referralSystemControllerGetReferrer,
	referralSystemControllerGetTierTables,
} from '@rips/api-client'
import { toTelegramIdHeader } from '../../utils/api/wrappers'
import { ActionDef, noPayload } from '../../action-def'
import { botStartLink } from '../../bot-identity'
import { toReset } from '../../flows'
import { ReferralSystemPage } from '../../pages/referral-system/referral-system-page'
import { EffectType } from '../../types'

export const openReferral: ActionDef<void> = noPayload(async (session) => {
	const { telegramId } = session

	const [{ data: referrerData }, { data: tierTables }] = await Promise.all([
		referralSystemControllerGetReferrer({
			headers: toTelegramIdHeader(telegramId),
		}),
		referralSystemControllerGetTierTables(),
	])

	// The invitee's account is created with this address, so the link carries
	// what the API records rather than an identifier it would have to resolve.
	const referralLink = botStartLink(referrerData.referrer)

	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page: ReferralSystemPage.render({
				referrerData,
				tierTables,
				referralLink,
			}),
		},
	}
})
