import {
	referralSystemControllerGetReferrer,
	referralSystemControllerGetTierTables,
} from '@rips/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { ReferralSystemPage } from '../../pages/referral-system/referral-system'
import { EffectType } from '../../types'
import { getEnvSafe } from '../../utils/common'

const botUsername = getEnvSafe('BOT_USERNAME')

export const openReferral: ActionDef<void> = noPayload(async (session) => {
	const { telegramId } = session

	const referralLink = `https://t.me/${botUsername}?start=${telegramId}`

	const [{ data: referrerData }, { data: tierTables }] = await Promise.all([
		referralSystemControllerGetReferrer({
			headers: { 'x-telegram-id': telegramId },
		}),
		referralSystemControllerGetTierTables(),
	])

	return {
		type: EffectType.EDIT,
		page: ReferralSystemPage.render({
			referrerData,
			tierTables,
			referralLink,
		}),
	}
})
