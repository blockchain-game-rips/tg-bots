import {
	CurrencyAmountDto,
	GetZapResultResponseDtoOutput,
	ripsControllerGetZapResult,
	walletsControllerSwap,
} from '../../../generated/api-client'
import { SwapFailedPage } from '../../pages/wallet/swap-failed-page'
import { SwapSuccessPage } from '../../pages/wallet/swap-success-page'
import { Effect, EffectType, SessionData } from '../../types'
import { toCurrencyAmount } from '../../utils/currency'
import { ErrorToRender } from '../../utils/error-to-render'
import { assertFlow, resetFlow } from '../../utils/session-utils'

const SWAP_POLL_INTERVAL_MS = 2000
const SWAP_POLL_TIMEOUT_MS = 60000

type SwapOutcome =
	| {
			status: 'success'
			result: NonNullable<GetZapResultResponseDtoOutput['success']>
	  }
	| { status: 'failed'; refund: CurrencyAmountDto }

async function pollSwapResult(zapId: string): Promise<SwapOutcome> {
	const deadline = Date.now() + SWAP_POLL_TIMEOUT_MS

	while (Date.now() < deadline) {
		const { data } = await ripsControllerGetZapResult({ query: { zapId } })

		if (data.cancelled !== null) {
			throw new ErrorToRender('Swap was cancelled')
		}

		if (data.failed !== null) {
			return { status: 'failed', refund: data.failed.refund }
		}

		if (data.success !== null) {
			return { status: 'success', result: data.success }
		}

		await new Promise((resolve) =>
			setTimeout(resolve, SWAP_POLL_INTERVAL_MS),
		)
	}

	throw new ErrorToRender('Swap timed out')
}

export async function executeSwap(
	session: SessionData,
	_payload: string | undefined,
): Promise<Effect> {
	assertFlow(session, 'swap', 'idle')

	const { currencyIn, currencyOut, amountIn, quotedAmountOut } =
		session.flow.data

	if (currencyIn === undefined || currencyOut === undefined) {
		throw new ErrorToRender('Select both tokens first')
	}

	if (amountIn === undefined || quotedAmountOut === undefined) {
		throw new ErrorToRender('Confirm swap details first')
	}

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

	resetFlow(session)

	if (outcome.status === 'failed') {
		return {
			type: EffectType.EDIT,
			page: SwapFailedPage.render({
				amountIn: amountInDisplay,
				refund: outcome.refund,
			}),
		}
	}

	return {
		type: EffectType.EDIT,
		page: SwapSuccessPage.render({
			amountIn: amountInDisplay,
			amountOut: quotedAmountOut,
			transactionId: swapResponse.srcTransaction.id,
		}),
	}
}
