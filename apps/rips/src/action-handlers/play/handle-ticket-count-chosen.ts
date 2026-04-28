import { BuyConfirmPage } from '../../pages/content/play/buy-confirm-page'
import { BuyInsufficientFundsPage } from '../../pages/content/play/buy-insufficient-funds-page'
import { resolveConfig } from '../../pages/utils'
import { Effect, EffectType, SessionData } from '../../types'
import { assertFlow, setFlowStep } from '../../utils/session-utils'
import { fetchNativeBalance, fetchStake } from '../../utils/units'
import { parseTicketCount } from '../../validation/ticket-count'

export async function handleTicketCountChosen(
	session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	const ticketCount = parseTicketCount(payload)

	assertFlow(session, 'buyTickets', 'stake-chosen')
	const { stakeId } = session.flow.data

	const availableStake = await fetchStake(stakeId)

	const balance = await fetchNativeBalance(session.telegramId)

	const config = resolveConfig(availableStake)
	const totalCost = BigInt(config.ticketPrice.amount) * BigInt(ticketCount)
	const balanceAmount = BigInt(balance.amount)

	setFlowStep(session, 'ticket-count-chosen', { stakeId, ticketCount })

	if (balanceAmount < totalCost) {
		return {
			type: EffectType.EDIT,
			page: BuyInsufficientFundsPage.render(
				balance,
				availableStake,
				ticketCount,
			),
		}
	}

	return {
		type: EffectType.EDIT,
		page: BuyConfirmPage.render(availableStake, ticketCount),
	}
}
