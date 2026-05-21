import { assertFlow } from '@rips/grammy-kit'
import { parseChain } from '@rips/shared'
import { ActionDef, withPayload } from '../../action-def'
import { SUPPORTED_CHAINS } from '../../constants'
import { ZapChooseTokenPage } from '../../pages/play/zap-choose-token-page'
import { Chain, EffectType } from '../../types'
import { fetchCurrencies, fetchStake } from '../../utils/api/wrappers'
import { findChainIndex, getCurrenciesForChain } from '../../utils/chain'

export const openZapChooseToken: ActionDef<Chain> = withPayload(
	(chain) => findChainIndex(chain).toString(),
	(raw) => parseChain(raw, SUPPORTED_CHAINS),
	async (session, chain) => {
		assertFlow(session, 'buyTickets', 'ticket-count-chosen')

		const { stakeId, ticketCount } = session.flow.data

		const [availableStake, currencies] = await Promise.all([
			fetchStake(stakeId),
			fetchCurrencies(getCurrenciesForChain(chain)),
		])

		return {
			type: EffectType.EDIT,
			page: ZapChooseTokenPage.render({
				availableStake,
				ticketCount,
				currencies,
			}),
		}
	},
)
