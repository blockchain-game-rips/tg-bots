import {
	referralSystemControllerGetReferrer,
	referralSystemControllerGetTierTables,
} from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { botStartLink } from '../../bot-identity'
import { toReset } from '../../flows'
import { ReferralSystemPage } from '../../pages/referral-system/referral-system-page'
import { EffectType } from '../../types'

export const openReferral: ActionDef<void> = noPayload(async (session) => {
	const { telegramId } = session

	const referralLink = botStartLink(telegramId)

	const [{ data: referrerData }, { data: tierTables }] = await Promise.all([
		referralSystemControllerGetReferrer({
			headers: { 'x-telegram-id': telegramId },
		}),
		referralSystemControllerGetTierTables(),
	])

	return {
		flow: toReset(),
		effect: {
			type: EffectType.EDIT,
			page: ReferralSystemPage.render({
				referrerData,
				tierTables,
				referralLink,
			}),
		},
	}
})
