import {
	CurrencyAmountDto,
	GetSwapResultResponseDtoOutput,
	walletsControllerGetSwapResult,
	walletsControllerSwap,
} from '@rips/api-client'
import { assertFlow, ErrorToRender, toHold, toReset } from '@rips/grammy-kit'
import { ActionDef, noPayload } from '../../action-def'
import { SwapFailedPage } from '../../pages/wallet/swap-failed-page'
import { SwapSuccessPage } from '../../pages/wallet/swap-success-page'
import { EffectType } from '../../types'
import { toCurrencyAmount } from '../../utils/currency'

const SWAP_POLL_INTERVAL_MS = 2000
const SWAP_POLL_TIMEOUT_MS = 60000

type SwapOutcome =
	| {
			status: 'success'
			result: NonNullable<GetSwapResultResponseDtoOutput['success']>
	  }
	| { status: 'failed'; refund: CurrencyAmountDto }

async function pollSwapResult(zapId: string): Promise<SwapOutcome> {
	const deadline = Date.now() + SWAP_POLL_TIMEOUT_MS

	while (Date.now() < deadline) {
		try {
			const { data } = await walletsControllerGetSwapResult({
				query: { zapId },
			})

			if (data.cancelled !== null)
				throw new ErrorToRender('Swap was cancelled')
			if (data.failed !== null)
				return { status: 'failed', refund: data.failed.refund }
			if (data.success !== null)
				return { status: 'success', result: data.success }
		} catch (err) {
			if (err instanceof ErrorToRender) throw err
		}

		await new Promise((resolve) =>
			setTimeout(resolve, SWAP_POLL_INTERVAL_MS),
		)
	}

	throw new ErrorToRender('Swap timed out')
}

export const executeSwap: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'swap', 'idle')

	const { currencyIn, currencyOut, amountIn, quotedAmountOut } =
		session.flow.data

	if (currencyIn === undefined || currencyOut === undefined) {
		throw new ErrorToRender('Select both tokens first')
	}

	if (amountIn === undefined || quotedAmountOut === undefined) {
		throw new ErrorToRender('Confirm swap details first')
	}

	return {
		flow: toHold(),
		effect: {
			type: EffectType.SEND_LOADING,
			message: 'Swapping...',
			next: async () => {
				const { data: swapResponse } = await walletsControllerSwap({
					headers: { 'x-telegram-id': session.telegramId },
					body: {
						tokenInChainAddress: currencyIn.chainAddress,
						tokenOutChainAddress: currencyOut.chainAddress,
						amountIn: amountIn.toString(),
					},
				})

				const outcome = await pollSwapResult(swapResponse.zapId)
				const amountInDisplay = toCurrencyAmount(
					BigInt(swapResponse.amountIn.amount),
					currencyIn,
				)

				if (outcome.status === 'failed') {
					return {
						flow: toReset(),
						effect: {
							type: EffectType.EDIT,
							page: SwapFailedPage.render({
								amountIn: amountInDisplay,
								refund: outcome.refund,
							}),
						},
					}
				}

				return {
					flow: toReset(),
					effect: {
						type: EffectType.EDIT,
						page: SwapSuccessPage.render({
							amountIn: amountInDisplay,
							amountOut: quotedAmountOut,
							transactionId: swapResponse.srcTransaction.id,
						}),
					},
				}
			},
		},
	}
})
