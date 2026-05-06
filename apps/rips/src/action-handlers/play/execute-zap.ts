import {
	CurrencyAmountDto,
	GetZapResultResponseDtoOutput,
	ripsControllerBuyTicketsZap,
	ripsControllerGetZapResult,
} from '../../../generated/api-client'
import { ActionDef, noPayload } from '../../action-def'
import { ZapFailedPage } from '../../pages/play/zap-failed-page'
import { ZapSuccessPage } from '../../pages/play/zap-success-page'
import { EffectType } from '../../types'
import { fetchStake } from '../../utils/api'
import { toCurrencyAmount } from '../../utils/currency'
import { ErrorToRender } from '../../utils/error-to-render'
import { assertFlow, resetFlow } from '../../utils/session-utils'

const ZAP_POLL_INTERVAL_MS = 2000
const ZAP_POLL_TIMEOUT_MS = 60000

type ZapOutcome =
	| {
			status: 'success'
			result: NonNullable<GetZapResultResponseDtoOutput['success']>
	  }
	| { status: 'failed'; refund: CurrencyAmountDto }

async function pollZapResult(zapId: string): Promise<ZapOutcome> {
	const deadline = Date.now() + ZAP_POLL_TIMEOUT_MS

	while (Date.now() < deadline) {
		const { data } = await ripsControllerGetZapResult({ query: { zapId } })

		if (data.cancelled !== null)
			throw new ErrorToRender('Zap was cancelled')
		if (data.failed !== null)
			return { status: 'failed', refund: data.failed.refund }
		if (data.success !== null)
			return { status: 'success', result: data.success }

		await new Promise((resolve) =>
			setTimeout(resolve, ZAP_POLL_INTERVAL_MS),
		)
	}

	throw new ErrorToRender('Zap timed out')
}

export const executeZap: ActionDef<void> = noPayload(async (session) => {
	assertFlow(session, 'buyTickets', 'zap-currency-chosen')

	const { stakeId, ticketCount, currency } = session.flow.data

	const { data: zapResponse } = await ripsControllerBuyTicketsZap({
		headers: { 'x-telegram-id': session.telegramId },
		body: {
			stakeId,
			ticketCount,
			paymentCurrencyChainAddress: currency.chainAddress,
		},
	})

	const outcome = await pollZapResult(zapResponse.zapId)
	const availableStake = await fetchStake(stakeId)
	const amountIn = toCurrencyAmount(
		BigInt(zapResponse.amountIn.amount),
		currency,
	)

	resetFlow(session)

	if (outcome.status === 'failed') {
		return {
			type: EffectType.EDIT,
			page: ZapFailedPage.render({
				availableStake,
				ticketCount,
				amountIn,
				refund: outcome.refund,
			}),
		}
	}

	return {
		type: EffectType.EDIT,
		page: ZapSuccessPage.render({
			availableStake,
			ticketCount,
			amountIn,
			zapSuccessResult: outcome.result,
		}),
	}
})
