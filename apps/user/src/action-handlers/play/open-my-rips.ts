import {
	ripsControllerGetFinishedRipCounts,
	ripsControllerGetOngoingRips,
	usersControllerGetUser,
} from '@rips/api-client'
import { entryCountFor, groupRipStatus, RipStatusGroup } from '@rips/shared'
import { ActionDef, noPayload } from '../../action-def'
import { toReset } from '../../flows'
import { MyRipsPage } from '../../pages/play/my-rips-page'
import { EffectType } from '../../types'
import { fetchUnrevealedPayouts } from '../../utils/api/wrappers'
import { evmAddressFromUser } from '../../utils/wallet'

export const openMyRips: ActionDef<void> = noPayload(async (session) => {
	const { telegramId } = session

	const { data: user } = await usersControllerGetUser({
		path: { telegramId },
	})

	const userEvmAddress = evmAddressFromUser(user)

	const [{ data: ripsData }, unrevealedPayouts, { data: finishedCounts }] =
		await Promise.all([
			ripsControllerGetOngoingRips(),
			fetchUnrevealedPayouts(telegramId),
			ripsControllerGetFinishedRipCounts({
				query: { userAddress: userEvmAddress },
			}),
		])

	const activeEntries = ripsData.rips
		.filter((rip) => groupRipStatus(rip.status) === RipStatusGroup.FILLING)
		.reduce((total, rip) => total + entryCountFor(rip, userEvmAddress), 0)

	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page: MyRipsPage.render({
				unopenedPulls: unrevealedPayouts.length,
				activeEntries,
				completedRips: finishedCounts.claimed,
				refundedRips: finishedCounts.refunded,
			}),
		},
	}
})
