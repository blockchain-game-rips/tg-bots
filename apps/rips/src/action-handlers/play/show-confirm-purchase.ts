import { ripsControllerGetStakes } from '../../../generated/api-client'
import { BuyConfirmPage } from '../../pages/content/play/buy-confirm-page'
import { BuyInsufficientFundsPage } from '../../pages/content/play/buy-insufficient-funds-page'
import { getConfig } from '../../pages/utils'
import { getFlowData } from '../../session-utils'
import { Effect, EffectType, SessionData } from '../../types'
import { ErrorToRender } from '../../utils/error-to-render'
import { fetchNativeBalance } from '../../utils/units'
import { parseTicketCount } from '../../validation/ticket-count'

export async function showConfirmPurchase(
	session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	const ticketCount = parseTicketCount(payload)

	const { stakeId } = getFlowData(session, 'buyTickets', 'stake-chosen')

	const { data } = await ripsControllerGetStakes()
	const availableStake = data.availableStakes.find(
		(s) => s.stake.id === stakeId,
	)

	if (availableStake === undefined) {
		throw new ErrorToRender('Stake not found')
	}

	const balance = await fetchNativeBalance(session.telegramId)

	const config = getConfig(availableStake)
	const totalCost = BigInt(config.ticketPrice.amount) * BigInt(ticketCount)
	const balanceAmount = BigInt(balance.amount)

	session.flow = {
		flowType: 'buyTickets',
		step: 'ticket-count-chosen',
		data: { stakeId, ticketCount },
	}

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
