import {
	referralSystemControllerGetReferrer,
	referralSystemControllerGetTierTables,
} from '../../../generated/api-client'
import { ReferralSystemPage } from '../../pages/referral-system/referral-system'
import { Effect, EffectType, SessionData } from '../../types'
import { getEnvSafe } from '../../utils/common'

const botUsername = getEnvSafe('BOT_USERNAME')

export async function openReferral(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
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
}
