import {
	CurrencyAmountDto,
	GetZapResultResponseDtoOutput,
	ripsControllerBuyEntriesZap,
	ripsControllerGetZapResult,
} from '@rips/api-client'
import { assertFlow, ErrorToRender, resetFlow } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { ZapFailedPage } from '../../pages/play/zap-failed-page'
import { ZapSuccessPage } from '../../pages/play/zap-success-page'
import { EffectType } from '../../types'
import { fetchPreset } from '../../utils/api/wrappers'
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
	assertFlow(session, 'buyEntries', 'zap-currency-chosen')

	const { presetId, entryCount, currency } = session.flow.data

	return {
		type: EffectType.SEND_LOADING,
		message: 'Buying entries...',
		next: async () => {
			const { data: zapResponse } = await ripsControllerBuyEntriesZap({
				headers: { 'x-telegram-id': session.telegramId },
				body: {
					presetId,
					entryCount,
					paymentCurrencyChainAddress: currency.chainAddress,
				},
			})

			const outcome = await pollZapResult(zapResponse.zapId)
			const availablePreset = await fetchPreset(presetId)
			const amountIn = toCurrencyAmount(
				BigInt(zapResponse.amountIn.amount),
				currency,
			)

			resetFlow(session)

			if (outcome.status === 'failed') {
				return {
					type: EffectType.EDIT,
					page: ZapFailedPage.render({
						availablePreset,
						entryCount,
						amountIn,
						refund: outcome.refund,
					}),
				}
			}

			return {
				type: EffectType.EDIT,
				page: ZapSuccessPage.render({
					availablePreset,
					entryCount,
					amountIn,
					zapSuccessResult: outcome.result,
				}),
			}
		},
	}
})
