import { ActionDef, withPayload } from '../../action-def'
import { SUPPORTED_CHAINS, SUPPORTED_CURRENCIES } from '../../constants'
import { ZapChooseTokenPage } from '../../pages/play/zap-choose-token-page'
import { Chain, EffectType } from '../../types'
import { fetchCurrencies, fetchStake } from '../../utils/api'
import { toCurrencyId } from '../../utils/currency'
import { assertFlow } from '../../utils/session-utils'
import { parseChain } from '../../validation/chain-index'

export const openZapChooseToken: ActionDef<Chain> = withPayload(
	(chain) =>
		SUPPORTED_CHAINS.findIndex(
			(c) =>
				c.namespace === chain.namespace &&
				c.reference === chain.reference,
		).toString(),
	(raw) => parseChain(raw),
	async (session, chain) => {
		assertFlow(session, 'buyTickets', 'ticket-count-chosen')

		const { stakeId, ticketCount } = session.flow.data

		const chainCurrencyIds = SUPPORTED_CURRENCIES.filter(
			(c) =>
				c.chain.namespace === chain.namespace &&
				c.chain.reference === chain.reference,
		).map(toCurrencyId)

		const [availableStake, currencies] = await Promise.all([
			fetchStake(stakeId),
			fetchCurrencies(chainCurrencyIds),
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
