import { assertFlow } from '@rips/grammy-kit'
import { ActionDef, withPayload } from '../../action-def'
import { ZapChooseTokenPage } from '../../pages/play/zap-choose-token-page'
import { Chain, EffectType } from '../../types'
import { fetchCurrencies, fetchStake } from '../../utils/api/wrappers'
import { findChainIndex, getCurrenciesForChain } from '../../utils/chain'
import { parseChain } from '../../validation/chain-index'

export const openZapChooseToken: ActionDef<Chain> = withPayload(
	(chain) => findChainIndex(chain).toString(),
	(raw) => parseChain(raw),
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
