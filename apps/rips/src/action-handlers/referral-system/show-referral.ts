import {
	referralSystemControllerGetReferrer,
	referralSystemControllerGetTierTables,
} from '../../../generated/api-client'
import { ReferralSystemPage } from '../../pages/content/referral-system/referral-system'
import { Effect, EffectType, SessionData } from '../../types'
import { getEnvSafe } from '../../utils/common'

export async function showReferral(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	const { telegramId } = session

	const botUsername = getEnvSafe('BOT_USERNAME')
	const referralLink = `https://t.me/${botUsername}?start=${telegramId}`

	const [{ data: referrerData }, { data: tierTables }] = await Promise.all([
		referralSystemControllerGetReferrer({
			headers: { 'x-telegram-id': telegramId },
		}),
		referralSystemControllerGetTierTables({ throwOnError: true }),
	])

	return {
		type: EffectType.EDIT,
		page: ReferralSystemPage.render({
			referrerData,
			tierTables,
			referralLink,
		}),
	}
}
