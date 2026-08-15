import {
	CurrencyAmountDtoOutput,
	CurrencyDtoOutput,
	GetSwapResultResponseDtoOutput,
	SwapBodyDto,
	TelegramIdHeaderDto,
	walletsControllerGetSwapResult,
	walletsControllerSwapCrosschain,
	walletsControllerSwapSamechain,
} from '@rips/api-client'
import { assertFlow, fmt, wait } from '@rips/grammy-kit'
import { currencyToChain, isSameChain, toCurrencyAmount } from '@rips/shared'
import { ActionDef, noPayload } from '../../../action-def'
import { balanceCache } from '../../../cache/balance-cache'
import { currencyCache } from '../../../cache/currency-cache'
import { withNative } from '../../../constants'
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

	return {
		effect: {
			type: EffectType.LOADING,
			message: fmt`Swapping...`,
			next: async () => {
				const srcCurrency = await currencyCache.getOne(srcChainAddress)

				return executeSwapRequest(
					session.telegramId,
					toCurrencyAmount(amountIn, srcCurrency),
					dstCurrency,
					draft,
				)
			},
		},
	}
})

interface SwapDraft {
	srcChainAddress: CurrencyDtoOutput['chainAddress']
	dstCurrency: CurrencyDtoOutput
	amountIn: bigint
}

async function executeSwapRequest(
	telegramId: string,
	amountIn: CurrencyAmountDtoOutput,
	dstCurrency: CurrencyDtoOutput,
	draft: SwapDraft,
): Promise<HandlerResult<Flow>> {
	const headers = { 'x-telegram-id': telegramId }
	const body = toSwapBody(amountIn, dstCurrency)

	const outcome = isSameChain(
		currencyToChain(amountIn.currency),
		currencyToChain(dstCurrency),
	)
		? await swapSamechain(headers, body)
		: await swapCrosschain(headers, body)

	await balanceCache.invalidate(telegramId, [
		...withNative(amountIn.currency.chainAddress),
		dstCurrency.chainAddress,
	])

	if (outcome.kind === 'failed') {
		throw await toSwapError(telegramId, draft, outcome.message)
	}

	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page: outcome.page,
			history: { kind: 'page' },
		},
	}
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

async function swapCrosschain(
	headers: TelegramIdHeaderDto,
	body: SwapBodyDto,
): Promise<SwapOutcome> {
	const response = await callOrUnknown(() =>
		walletsControllerSwapCrosschain({ headers, body }),
	)

	if (response === null) return failed(unknownMessage(swapNouns))

	const { zap } = response.data

	if (zap.status !== 'succeeded') {
		return failed(failureMessage(zap, swapNouns))
	}

	const result = await pollSwapResult(zap.result.zapId)

	if (result.kind !== 'success') return failed(result.message)

	return {
		kind: 'swapped',
		page: SwapSuccessPage.render({
			kind: 'crosschain',
			amountOut: result.success.amountOut,
			srcTransaction: zap.transaction,
			dstTransaction: result.success.dstTransaction,
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
