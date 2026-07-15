import {
	CurrencyAmountDto,
	CurrencyDto,
	GetSwapResultResponseDtoOutput,
	SwapBodyDto,
	TelegramIdHeaderDto,
	walletsControllerGetSwapResult,
	walletsControllerSwapCrosschain,
	walletsControllerSwapSamechain,
} from '@rips/api-client'
import { assertFlow, ErrorToRender, wait } from '@rips/grammy-kit'
import { toCurrencyAmount } from '@rips/shared'
import { ActionDef, noPayload } from '../../../action-def'
import { Flow, toHold, toReset } from '../../../flows'
import { SwapSuccessPage } from '../../../pages/swap/swap-success-page'
import { Chain, EffectType, HandlerResult } from '../../../types'

const SWAP_POLL_INTERVAL_MS = 2000
const SWAP_POLL_TIMEOUT_MS = 60000

type SwapSuccess = NonNullable<GetSwapResultResponseDtoOutput['success']>

export const executeSwap: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'swap', 'src-dst-amount-chosen')

	const { srcCurrencyBalance, dstCurrency, amountIn } = session.flow.data

	const amountInDto = toCurrencyAmount(amountIn, srcCurrencyBalance.currency)

	return {
		flow: toHold(),
		effect: {
			type: EffectType.SEND_LOADING,
			message: 'Swapping...',
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
	amountIn: CurrencyAmountDto,
	dstCurrency: CurrencyDto,
): Promise<HandlerResult<Flow>> {
	const headers = { 'x-telegram-id': telegramId }
	const body = toSwapBody(amountIn, dstCurrency)

	const page = isSameChain(
		amountIn.currency.chainAddress.chain,
		dstCurrency.chainAddress.chain,
	)
		? await swapSamechain(headers, body)
		: await swapCrosschain(headers, body)

	return {
		flow: toReset(),
		effect: {
			type: EffectType.EDIT,
			page,
		},
	}
}

function toSwapBody(
	amountIn: CurrencyAmountDto,
	dstCurrency: CurrencyDto,
): SwapBodyDto {
	return {
		tokenInChainAddress: amountIn.currency.chainAddress,
		tokenOutChainAddress: dstCurrency.chainAddress,
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

function isSameChain(a: Chain, b: Chain): boolean {
	return a.namespace === b.namespace && a.reference === b.reference
}
