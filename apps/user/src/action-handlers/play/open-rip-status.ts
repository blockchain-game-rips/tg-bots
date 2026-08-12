import { groupRipStatus, parseRipId, RipStatusGroup } from '@rips/shared'
import { RipDtoOutput, usersControllerGetUser } from '@rips/api-client'
import { ActionDef, withPayload } from '../../action-def'
import { toReset } from '../../flows'
import {
	RipDetailPage,
	RipDetailVariant,
} from '../../pages/play/rip-detail-page'
import { EffectType } from '../../types'
import { fetchRip, fetchRipPayouts } from '../../utils/api/wrappers'
import { evmAddressFromUser } from '../../utils/wallet'

export const openRipStatus: ActionDef<number> = withPayload(
	{
		encode: (ripId) => ripId.toString(),
		decode: (raw) => parseRipId(raw),
	},
	async (session, ripId) => {
		const { telegramId } = session

		const [rip, { data: user }] = await Promise.all([
			fetchRip(ripId),
			usersControllerGetUser({
				path: { telegramId },
			}),
		])

		const userAddress = evmAddressFromUser(user)

		const variant = await buildVariant(rip, userAddress, telegramId)

		return {
			flow: toReset(),
			effect: {
				type: EffectType.NAVIGATE,
				page: RipDetailPage.render(variant),
			},
		}
	},
)

async function buildVariant(
	rip: RipDtoOutput,
	userAddress: string,
	telegramId: string,
): Promise<RipDetailVariant> {
	const group = groupRipStatus(rip.status)

	if (group === RipStatusGroup.COMPLETED) {
		const payouts = await fetchRipPayouts(telegramId, rip.id)

		return { group, rip, userAddress, payouts }
	}

	return { group, rip, userAddress }
}
