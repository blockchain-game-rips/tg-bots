import { assertFlow, ErrorToRender, resetFlow } from '@rips/grammy-kit'
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
import { fetchStake } from '../../utils/api/wrappers'
import { toCurrencyAmount } from '../../utils/currency'

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
		try {
			const { data } = await ripsControllerGetZapResult({
				query: { zapId },
			})

			if (data.cancelled !== null)
				throw new ErrorToRender('Zap was cancelled')
			if (data.failed !== null)
				return { status: 'failed', refund: data.failed.refund }
			if (data.success !== null)
				return { status: 'success', result: data.success }
		} catch (err) {
			if (err instanceof ErrorToRender) throw err
		}

		await new Promise((resolve) =>
			setTimeout(resolve, ZAP_POLL_INTERVAL_MS),
		)
	}

	throw new ErrorToRender('Zap timed out')
}

export const executeZap: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'buyTickets', 'zap-currency-chosen')

	const { stakeId, ticketCount, currency } = session.flow.data

	return {
		type: EffectType.SEND_LOADING,
		message: 'Buying tickets...',
		next: async () => {
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
		},
	}
})
