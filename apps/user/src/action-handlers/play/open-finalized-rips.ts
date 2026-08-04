import {
	ripsControllerGetFinishedRips,
	usersControllerGetUser,
} from '@rips/api-client'
import { ActionDef, withPayload } from '../../action-def'
import { toReset } from '../../flows'
import { FinalizedRipsPage } from '../../pages/play/finalized-rips-page'
import { EffectType } from '../../types'
import { evmAddressFromUser } from '../../utils/wallet'

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
				type: EffectType.EDIT,
				page: FinalizedRipsPage.render(data.rips, mineOnly),
			},
		}
	},
)

async function fetchUserEvmAddress(telegramId: string): Promise<string> {
	const { data: user } = await usersControllerGetUser({
		path: { telegramId },
	})

	return evmAddressFromUser(user)
}
