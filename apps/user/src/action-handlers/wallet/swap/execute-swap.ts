import {
	CurrencyAmountDtoOutput,
	CurrencyDtoOutput,
	GetSwapResultResponseDtoOutput,
	SwapBodyDto,
	TelegramIdHeaderDto,
	TransactionDtoOutput,
	walletsControllerGetSwapResult,
	walletsControllerSwapCrosschain,
	walletsControllerSwapSamechain,
} from '@rips/api-client'
import { assertFlow, wait } from '@rips/grammy-kit'
import { currencyToChain, isSameChain, toCurrencyAmount } from '@rips/shared'
import { ActionDef, noPayload } from '../../../action-def'
import { balanceCache } from '../../../cache/balance-cache'
import { currencyCache } from '../../../cache/currency-cache'
import { withNative } from '../../../constants'
import {
	sentFrame,
	SWAP_FRAME,
	SWAP_SENDING_FRAME,
} from '../../../domain/loading-frames'
import { Flow, toReset } from '../../../flows'
import { SwapSuccessPage } from '../../../pages/swap/swap-success-page'
import { EffectType, HandlerResult, PageContent } from '../../../types'
import { callOrUnknown } from '../../../utils/api/call-or-unknown'
import { errorOnFreshPage } from '../../../utils/display/error-on-fresh-page'
import {
	cancelledMessage,
	swapNouns,
	unknownMessage,
} from '../../../utils/display/transaction-outcome-copy'
import { failureMessage } from '../../../utils/display/transaction-status'
import { renderSwapCheckoutPage } from './open-swap-checkout'

const SWAP_POLL_INTERVAL_MS = 2000
const SWAP_POLL_TIMEOUT_MS = 60000

type SwapSuccess = NonNullable<GetSwapResultResponseDtoOutput['success']>

export const executeSwap: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'swap', 'src-dst-amount-chosen')

	const draft = session.flow.data
	const { srcChainAddress, dstCurrency, amountIn } = draft

	const isCrosschain = !isSameChain(
		srcChainAddress.chain,
		currencyToChain(dstCurrency),
	)

	return {
		effect: {
			type: EffectType.LOADING,
			message: isCrosschain ? SWAP_SENDING_FRAME : SWAP_FRAME,
			next: async () => {
				const srcCurrency = await currencyCache.getOne(srcChainAddress)

				const amount = toCurrencyAmount(amountIn, srcCurrency)

				return isCrosschain
					? sendCrosschainSwap(session.telegramId, amount, draft)
					: executeSamechainSwap(session.telegramId, amount, draft)
			},
		},
	}
})

interface SwapDraft {
	srcChainAddress: CurrencyDtoOutput['chainAddress']
	dstCurrency: CurrencyDtoOutput
	amountIn: bigint
}

async function invalidateSwapBalances(
	telegramId: string,
	amountIn: CurrencyAmountDtoOutput,
	dstCurrency: CurrencyDtoOutput,
): Promise<void> {
	await balanceCache.invalidate(telegramId, [
		...withNative(amountIn.currency.chainAddress),
		dstCurrency.chainAddress,
	])
}

function toSwapSuccess(page: PageContent): HandlerResult<Flow> {
	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page,
			history: { kind: 'page' },
		},
	}
}

async function executeSamechainSwap(
	telegramId: string,
	amountIn: CurrencyAmountDtoOutput,
	draft: SwapDraft,
): Promise<HandlerResult<Flow>> {
	const { dstCurrency } = draft

	const outcome = await swapSamechain(
		{ 'x-telegram-id': telegramId },
		toSwapBody(amountIn, dstCurrency),
	)

	await invalidateSwapBalances(telegramId, amountIn, dstCurrency)

	if (outcome.kind === 'failed') {
		throw await toSwapError(telegramId, draft, outcome.message)
	}

	return toSwapSuccess(outcome.page)
}

/**
 * Stops at the sent transaction so the second frame can show it. Balances stay
 * untouched until the zap settles — invalidating here would refetch a balance
 * the in-flight swap is about to change again.
 */
async function sendCrosschainSwap(
	telegramId: string,
	amountIn: CurrencyAmountDtoOutput,
	draft: SwapDraft,
): Promise<HandlerResult<Flow>> {
	const { dstCurrency } = draft

	const response = await callOrUnknown(() =>
		walletsControllerSwapCrosschain({
			headers: { 'x-telegram-id': telegramId },
			body: toSwapBody(amountIn, dstCurrency),
		}),
	)

	if (response === null) {
		await invalidateSwapBalances(telegramId, amountIn, dstCurrency)

		throw await toSwapError(telegramId, draft, unknownMessage(swapNouns))
	}

	const { zap } = response.data

	if (zap.status !== 'succeeded') {
		await invalidateSwapBalances(telegramId, amountIn, dstCurrency)

		throw await toSwapError(
			telegramId,
			draft,
			failureMessage(zap, swapNouns),
		)
	}

	return {
		effect: {
			type: EffectType.LOADING,
			message: sentFrame(zap.transaction, currencyToChain(dstCurrency)),
			next: () =>
				awaitCrosschainSwap(
					telegramId,
					amountIn,
					draft,
					zap.result.zapId,
					zap.transaction,
				),
		},
	}
}

async function awaitCrosschainSwap(
	telegramId: string,
	amountIn: CurrencyAmountDtoOutput,
	draft: SwapDraft,
	zapId: string,
	srcTransaction: TransactionDtoOutput,
): Promise<HandlerResult<Flow>> {
	const { dstCurrency } = draft

	const result = await pollSwapResult(zapId)

	await invalidateSwapBalances(telegramId, amountIn, dstCurrency)

	if (result.kind !== 'success') {
		throw await toSwapError(telegramId, draft, result.message)
	}

	return toSwapSuccess(
		SwapSuccessPage.render({
			kind: 'crosschain',
			amountOut: result.success.amountOut,
			srcTransaction,
			dstTransaction: result.success.dstTransaction,
		}),
	)
}

function toSwapError(telegramId: string, draft: SwapDraft, message: string) {
	return errorOnFreshPage(
		() => renderSwapCheckoutPage(telegramId, draft),
		message,
	)
}

function toSwapBody(
	amountIn: CurrencyAmountDtoOutput,
	dstCurrency: CurrencyDtoOutput,
): SwapBodyDto {
	return {
		currencyInChainAddress: amountIn.currency.chainAddress,
		currencyOutChainAddress: dstCurrency.chainAddress,
		amountIn: amountIn.amount,
	}
}

type SwapOutcome =
	| { kind: 'swapped'; page: PageContent }
	| { kind: 'failed'; message: string }

function failed(message: string): SwapOutcome {
	return { kind: 'failed', message }
}

async function swapSamechain(
	headers: TelegramIdHeaderDto,
	body: SwapBodyDto,
): Promise<SwapOutcome> {
	const response = await callOrUnknown(() =>
		walletsControllerSwapSamechain({ headers, body }),
	)

	if (response === null) return failed(unknownMessage(swapNouns))

	const { swap } = response.data

	if (swap.status !== 'succeeded') {
		return failed(failureMessage(swap, swapNouns))
	}

	return {
		kind: 'swapped',
		page: SwapSuccessPage.render({
			kind: 'samechain',
			amountOut: swap.result.amountOut,
			transaction: swap.transaction,
		}),
	}
}

type PollResult =
	| { kind: 'success'; success: SwapSuccess }
	| { kind: 'failed'; message: string }

/**
 * Retries through thrown errors until the deadline, so a transient blip does
 * not discard a swap that is still in flight. Only the deadline ends the loop.
 */
async function pollSwapResult(zapId: string): Promise<PollResult> {
	const deadline = Date.now() + SWAP_POLL_TIMEOUT_MS

	while (Date.now() < deadline) {
		const response = await callOrUnknown(() =>
			walletsControllerGetSwapResult({ query: { zapId } }),
		)

		const data = response?.data

		if (data !== undefined) {
			if (data.success !== null) {
				return { kind: 'success', success: data.success }
			}

			// the swap result carries no refund detail, unlike a zap
			if (data.cancelled !== null) {
				return { kind: 'failed', message: cancelledMessage(swapNouns) }
			}
		}

		await wait(SWAP_POLL_INTERVAL_MS)
	}

	return { kind: 'failed', message: unknownMessage(swapNouns) }
}
