import {
	AvailablePresetDtoOutput,
	BuyEntriesZapBodyDto,
	GetZapResultResponseDtoOutput,
	ripsControllerBuyEntriesPurchase,
	ripsControllerBuyEntriesZapCrosschain,
	ripsControllerBuyEntriesZapSamechain,
	ripsControllerGetZapResult,
	RipDtoOutput,
	TelegramIdHeaderDto,
	TransactionDtoOutput,
} from '@rips/api-client'
import { assertFlow, fmt, wait } from '@rips/grammy-kit'
import { resolveConfig } from '@rips/shared'
import { ActionDef, noPayload } from '../../../action-def'
import { balanceCache } from '../../../cache/balance-cache'
import { presetCache } from '../../../cache/preset-cache'
import { NATIVE_ON_BASE, withNative } from '../../../constants'
import { resolvePaymentRoute } from '../../../domain/payment-route'
import { Flow, toReset } from '../../../flows'
import {
	EnterSuccessArgs,
	EnterSuccessPage,
} from '../../../pages/play/enter-success-page'
import { EffectType, HandlerResult } from '../../../types'
import { fetchRip } from '../../../utils/api/wrappers'
import { TransactionOutcome } from '../../../utils/display/transaction-outcome'
import {
	cancelledMessage,
	enterNouns,
	refundedMessage,
	unknownMessage,
} from '../../../utils/display/transaction-outcome-copy'
import { failureMessage } from '../../../utils/display/transaction-status'
import { callOrUnknown } from '../../../utils/api/call-or-unknown'
import { errorOnFreshPage } from '../../../utils/display/error-on-fresh-page'
import { renderCheckoutPage } from './open-enter-checkout'

const ZAP_POLL_INTERVAL_MS = 2000
const ZAP_POLL_TIMEOUT_MS = 60000

type ZapSuccess = NonNullable<GetZapResultResponseDtoOutput['success']>

interface EntryResult {
	ripId: number
	entryCount: number
	startEntryIndex: number
}

/** The parts of a buy response every route returns. */
interface PurchaseOutcome {
	ripId: number
	entryCount: number
	startEntryIndex: number
	transactions: TransactionOutcome
}

export const executeEnter: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'enter', 'at-checkout')

	const { presetId, entryCount, payChainAddress } = session.flow.data

	const body: BuyEntriesZapBodyDto = {
		presetId,
		entryCount,
		paymentCurrencyChainAddress: payChainAddress,
	}

	return {
		effect: {
			type: EffectType.LOADING,
			message: fmt`Entering...`,
			next: () => executeEnterRequest(session.telegramId, body),
		},
	}
})

async function executeEnterRequest(
	telegramId: string,
	body: BuyEntriesZapBodyDto,
): Promise<HandlerResult<Flow>> {
	const headers = { 'x-telegram-id': telegramId }

	const availablePreset = await presetCache.getOne(body.presetId)

	const outcome = await buyEntries(
		resolvePaymentRoute(body.paymentCurrencyChainAddress),
		headers,
		body,
	)

	await balanceCache.invalidate(telegramId, [
		...withNative(body.paymentCurrencyChainAddress),
		NATIVE_ON_BASE,
	])

	if (outcome.kind === 'failed') {
		throw await toEnterError(telegramId, body, outcome.message)
	}

	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page: EnterSuccessPage.render(
				await toSuccessArgs(availablePreset, outcome.purchase),
			),
			history: { kind: 'page' },
		},
	}
}

function toEnterError(
	telegramId: string,
	body: BuyEntriesZapBodyDto,
	message: string,
) {
	return errorOnFreshPage(
		() =>
			renderCheckoutPage(telegramId, {
				presetId: body.presetId,
				entryCount: body.entryCount,
				payChainAddress: body.paymentCurrencyChainAddress,
			}),
		message,
	)
}

type BuyResult =
	| { kind: 'bought'; purchase: PurchaseOutcome }
	| { kind: 'failed'; message: string }

function failed(message: string): BuyResult {
	return { kind: 'failed', message }
}

async function buyEntries(
	route: ReturnType<typeof resolvePaymentRoute>,
	headers: TelegramIdHeaderDto,
	body: BuyEntriesZapBodyDto,
): Promise<BuyResult> {
	if (route === 'direct') return buyDirect(headers, body)

	if (route === 'samechain') return buySamechain(headers, body)

	return buyCrosschain(headers, body)
}

async function buyDirect(
	headers: TelegramIdHeaderDto,
	body: BuyEntriesZapBodyDto,
): Promise<BuyResult> {
	const response = await callOrUnknown(() =>
		ripsControllerBuyEntriesPurchase({ headers, body }),
	)

	if (response === null) return failed(unknownMessage(enterNouns))

	const { purchase } = response.data

	if (purchase.status !== 'succeeded') {
		return failed(failureMessage(purchase, enterNouns))
	}

	return boughtOnOneChain(purchase.result, purchase.transaction)
}

async function buySamechain(
	headers: TelegramIdHeaderDto,
	body: BuyEntriesZapBodyDto,
): Promise<BuyResult> {
	const response = await callOrUnknown(() =>
		ripsControllerBuyEntriesZapSamechain({ headers, body }),
	)

	if (response === null) return failed(unknownMessage(enterNouns))

	const { enter } = response.data

	if (enter.status !== 'succeeded') {
		return failed(failureMessage(enter, enterNouns))
	}

	return boughtOnOneChain(enter.result, enter.transaction)
}

function boughtOnOneChain(
	result: EntryResult,
	transaction: TransactionDtoOutput,
): BuyResult {
	return {
		kind: 'bought',
		purchase: {
			...result,
			transactions: { kind: 'singleChain', transaction },
		},
	}
}

async function buyCrosschain(
	headers: TelegramIdHeaderDto,
	body: BuyEntriesZapBodyDto,
): Promise<BuyResult> {
	const response = await callOrUnknown(() =>
		ripsControllerBuyEntriesZapCrosschain({ headers, body }),
	)

	if (response === null) return failed(unknownMessage(enterNouns))

	const { zap } = response.data

	if (zap.status !== 'succeeded') {
		return failed(failureMessage(zap, enterNouns))
	}

	const result = await pollZapResult(zap.result.zapId)

	if (result.kind !== 'success') return failed(result.message)

	return {
		kind: 'bought',
		purchase: {
			ripId: result.success.ripId,
			entryCount: result.success.entryCount,
			startEntryIndex: result.success.startEntryIndex,
			transactions: {
				kind: 'crosschain',
				srcTransaction: zap.transaction,
				dstTransaction: result.success.dstTransaction,
			},
		},
	}
}

type PollResult =
	| { kind: 'success'; success: ZapSuccess }
	| { kind: 'failed'; message: string }

/**
 * Retries through thrown errors until the deadline, so a transient blip does
 * not discard a zap that is still in flight. Only the deadline ends the loop.
 */
async function pollZapResult(zapId: string): Promise<PollResult> {
	const deadline = Date.now() + ZAP_POLL_TIMEOUT_MS

	while (Date.now() < deadline) {
		const response = await callOrUnknown(() =>
			ripsControllerGetZapResult({ query: { zapId } }),
		)

		const data = response?.data

		if (data !== undefined) {
			if (data.success !== null) {
				return { kind: 'success', success: data.success }
			}

			if (data.failed !== null) {
				return {
					kind: 'failed',
					message: refundedMessage(enterNouns, data.failed.refund),
				}
			}

			if (data.cancelled !== null) {
				return { kind: 'failed', message: cancelledMessage(enterNouns) }
			}
		}

		await wait(ZAP_POLL_INTERVAL_MS)
	}

	return { kind: 'failed', message: unknownMessage(enterNouns) }
}

/**
 * The purchase response is authoritative but reports only this purchase, while
 * the indexed rip sees every purchase yet may lag behind the one just made. Use
 * the fresher config when the rip loads, and take the higher of the two entry
 * counts; fall back to the flow's preset when the rip cannot be read at all.
 */
async function toSuccessArgs(
	availablePreset: AvailablePresetDtoOutput,
	outcome: PurchaseOutcome,
): Promise<EnterSuccessArgs> {
	const { ripId, entryCount, startEntryIndex, transactions } = outcome

	const entriesAfterPurchase = startEntryIndex + entryCount

	const rip = await fetchRipOrNull(ripId)

	const config = rip?.config ?? resolveConfig(availablePreset)

	const filledEntries =
		rip === null
			? entriesAfterPurchase
			: Math.max(entriesAfterPurchase, indexedEntries(rip))

	return {
		entryPrice: config.entryPrice,
		entryCap: config.entryCap,
		filledEntries,
		ripId,
		entryCount,
		transactions,
	}
}

function indexedEntries(rip: RipDtoOutput): number {
	return rip.actions.purchases.reduce(
		(total, purchase) => total + purchase.entryCount,
		0,
	)
}

async function fetchRipOrNull(ripId: number): Promise<RipDtoOutput | null> {
	try {
		return await fetchRip(ripId)
	} catch {
		return null
	}
}
