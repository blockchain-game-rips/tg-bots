import {
	ripsControllerGetFinishedRips,
	usersControllerGetUser,
} from '@rips/api-client'
import { ActionDef, withPayload } from '../../action-def'
import { toReset } from '../../flows'
import { FinalizedRipsPage } from '../../pages/play/finalized-rips-page'
import { EffectType } from '../../types'
import { evmAddressFromUser } from '../../utils/wallet'
import { buildActionData } from '@rips/grammy-kit'
import { actionIds } from '../../action-ids'

const FINALIZED_RIPS_LIMIT = 10

const MINE_ONLY_FLAG = '1'

export const openFinalizedRips: ActionDef<boolean> = withPayload(
	{
		encode: (mineOnly) => (mineOnly ? MINE_ONLY_FLAG : ''),
		decode: (raw) => raw === MINE_ONLY_FLAG,
	},
	async (session, mineOnly) => {
		const userAddress = mineOnly
			? await fetchUserEvmAddress(session.telegramId)
			: undefined

		const { data } = await ripsControllerGetFinishedRips({
			query: { limit: FINALIZED_RIPS_LIMIT, userAddress },
		})

		return {
			flow: toReset(),
			effect: {
				type: EffectType.NAVIGATE,
				page: FinalizedRipsPage.render(data.rips, mineOnly),
				history: {
					replayWith: buildActionData(
						actionIds.openFinalizedRips,
						false,
					),
				},
			},
		}
	},
)

async function fetchUserEvmAddress(telegramId: number): Promise<string> {
	const { data: user } = await usersControllerGetUser({
		path: { telegramId: telegramId.toString() },
	})

	return evmAddressFromUser(user)
}
