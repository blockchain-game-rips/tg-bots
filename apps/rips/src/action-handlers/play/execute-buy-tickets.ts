import {
	ripsControllerBuyTicketsPurchase,
	ripsControllerGetOngoingRounds,
} from '../../../generated/api-client'
import { NATIVE_ON_BASE } from '../../constants'
import { ActionDef, noPayload } from '../../grammy-kit/action/action-def'
import { ErrorToRender } from '../../grammy-kit/effects/error-to-render'
import { assertFlow, resetFlow } from '../../grammy-kit/session/session-utils'
import { BuySuccessPage } from '../../pages/play/buy-success-page'
import { EffectType } from '../../types'
import { isApiErrorWithStatus } from '../../utils/api/error'

const TRANSACTION_REVERTED_STATUS = 502

export const executeBuyTickets: ActionDef<void> = noPayload(async (session) => {
	assertFlow(session, 'buyTickets', 'ticket-count-chosen')
	const { stakeId, ticketCount } = session.flow.data

	const { data: purchase } = await ripsControllerBuyTicketsPurchase({
		headers: { 'x-telegram-id': session.telegramId },
		body: {
			stakeId,
			ticketCount,
			paymentCurrencyChainAddress: NATIVE_ON_BASE,
		},
	}).catch((error: unknown) => {
		if (isApiErrorWithStatus(error, TRANSACTION_REVERTED_STATUS)) {
			throw new ErrorToRender(error.message)
		}

		throw error
	})

	const { data: roundsData } = await ripsControllerGetOngoingRounds()

	const round = roundsData.rounds.find((r) => r.id === purchase.roundId)

	resetFlow(session)

	return {
		type: EffectType.EDIT,
		page: BuySuccessPage.render(purchase, round),
	}
})
