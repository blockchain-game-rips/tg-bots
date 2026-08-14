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
import { assertFlow, ErrorToRender, fmt, wait } from '@rips/grammy-kit'
import { currencyToChain, isSameChain, toCurrencyAmount } from '@rips/shared'
import { ActionDef, noPayload } from '../../../action-def'
import { balanceCache } from '../../../cache/balance-cache'
import { withNative } from '../../../constants'
import { Flow, toReset } from '../../../flows'
import { SwapSuccessPage } from '../../../pages/swap/swap-success-page'
import { EffectType, HandlerResult } from '../../../types'

const SWAP_POLL_INTERVAL_MS = 2000
const SWAP_POLL_TIMEOUT_MS = 60000

type SwapSuccess = NonNullable<GetSwapResultResponseDtoOutput['success']>

export const executeSwap: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'swap', 'src-dst-amount-chosen')

	const { srcCurrencyBalance, dstCurrency, amountIn } = session.flow.data

	const amountInDto = toCurrencyAmount(amountIn, srcCurrencyBalance.currency)

	return {
		effect: {
			type: EffectType.LOADING,
			message: fmt`Swapping...`,
			next: () =>
				executeSwapRequest(
					session.telegramId,
					amountInDto,
					dstCurrency,
				),
		},
	}
})

async function executeSwapRequest(
	telegramId: string,
	amountIn: CurrencyAmountDtoOutput,
	dstCurrency: CurrencyDtoOutput,
): Promise<HandlerResult<Flow>> {
	const headers = { 'x-telegram-id': telegramId }
	const body = toSwapBody(amountIn, dstCurrency)

	const page = isSameChain(
		currencyToChain(amountIn.currency),
		currencyToChain(dstCurrency),
	)
		? await swapSamechain(headers, body)
		: await swapCrosschain(headers, body)

	await balanceCache.invalidate(telegramId, [
		...withNative(amountIn.currency.chainAddress),
		dstCurrency.chainAddress,
	])

	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page,
		},
	}
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

async function swapSamechain(headers: TelegramIdHeaderDto, body: SwapBodyDto) {
	const { data } = await walletsControllerSwapSamechain({ headers, body })

	return SwapSuccessPage.render({ kind: 'samechain', result: data })
}

async function swapCrosschain(headers: TelegramIdHeaderDto, body: SwapBodyDto) {
	const { data: swapResponse } = await walletsControllerSwapCrosschain({
		headers,
		body,
	})

	const result = await pollSwapResult(swapResponse.zapId)

	return SwapSuccessPage.render({ kind: 'crosschain', swapResponse, result })
}

async function pollSwapResult(zapId: string): Promise<SwapSuccess> {
	const deadline = Date.now() + SWAP_POLL_TIMEOUT_MS

	while (Date.now() < deadline) {
		const { data } = await walletsControllerGetSwapResult({
			query: { zapId },
		})

		if (data.success !== null) return data.success

		if (data.pending === null) throw new ErrorToRender('Swap failed')

		await wait(SWAP_POLL_INTERVAL_MS)
	}

	throw new ErrorToRender('Swap timed out')
}
