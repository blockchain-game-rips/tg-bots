import { currencyControllerGetCurrencies } from '../../../generated/api-client'
import { SUPPORTED_CURRENCIES } from '../../constants'
import { ZapChooseTokenPage } from '../../pages/play/zap-choose-token-page'
import { Effect, EffectType, SessionData } from '../../types'
import { fetchStake } from '../../utils/api'
import { toCurrencyId } from '../../utils/currency'
import { assertFlow } from '../../utils/session-utils'
import { parseChain } from '../../validation/chain-index'

export async function openZapChooseToken(
	session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	assertFlow(session, 'buyTickets', 'ticket-count-chosen')

	const { stakeId, ticketCount } = session.flow.data

	const chain = parseChain(payload)

	const chainCurrencyIds = SUPPORTED_CURRENCIES.filter(
		(c) =>
			c.chain.namespace === chain.namespace &&
			c.chain.reference === chain.reference,
	).map(toCurrencyId)

	const [availableStake, { data }] = await Promise.all([
		fetchStake(stakeId),
		currencyControllerGetCurrencies({
			query: { chainAddress: chainCurrencyIds },
		}),
	])

	return {
		type: EffectType.EDIT,
		page: ZapChooseTokenPage.render({
			availableStake,
			ticketCount,
			currencies: data.currencies,
		}),
	}
}
