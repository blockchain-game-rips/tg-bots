import {
	AvailablePresetDtoOutput,
	BuyEntriesZapBodyDto,
	GetZapResultResponseDtoOutput,
	ripsControllerBuyEntriesPurchase,
	ripsControllerBuyEntriesZapCrosschain,
	ripsControllerBuyEntriesZapSamechain,
	ripsControllerGetZapResult,
	RipDtoOutput,
	RipsControllerBuyEntriesPurchaseData,
	RipsControllerBuyEntriesZapSamechainData,
	TransactionDtoOutput,
} from '@rips/api-client'
import { assertFlow, wait } from '@rips/grammy-kit'
import { resolveConfig } from '@rips/shared'
import { ActionDef, noPayload } from '../../../action-def'
import { balanceCache } from '../../../cache/balance-cache'
import { presetCache } from '../../../cache/preset-cache'
import { NATIVE_ON_BASE, withNative } from '../../../constants'
import {
	ENTER_FRAME,
	ENTER_SENDING_FRAME,
	sentFrame,
} from '../../../domain/loading-frames'
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
import { userApiKey } from '../../../utils/api/key'

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

	const route = resolvePaymentRoute(payChainAddress)

	const isCrosschain = route === 'crosschain'

	return {
		effect: {
			type: EffectType.LOADING,
			message: isCrosschain ? ENTER_SENDING_FRAME : ENTER_FRAME,
			next: async () => {
				// Read before anything is sent: a missing preset throws, and
				// after a purchase that throw would strand a user whose funds
				// have already moved.
				const availablePreset = await presetCache.getOne(presetId)

				return isCrosschain
					? sendCrosschainEnter(
							session.telegramId,
							body,
							availablePreset,
						)
					: executeOnOneChain(
							session.telegramId,
							route,
							body,
							availablePreset,
						)
			},
		},
	}
})

async function invalidateEnterBalances(
	telegramId: number,
	body: BuyEntriesZapBodyDto,
): Promise<void> {
	await balanceCache.invalidate(telegramId, [
		...withNative(body.paymentCurrencyChainAddress),
		NATIVE_ON_BASE,
	])
}

async function toEnterSuccess(
	availablePreset: AvailablePresetDtoOutput,
	purchase: PurchaseOutcome,
): Promise<HandlerResult<Flow>> {
	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page: EnterSuccessPage.render(
				await toSuccessArgs(availablePreset, purchase),
			),
			history: { kind: 'page' },
		},
	}
}

async function executeOnOneChain(
	telegramId: number,
	route: Exclude<ReturnType<typeof resolvePaymentRoute>, 'crosschain'>,
	body: BuyEntriesZapBodyDto,
	availablePreset: AvailablePresetDtoOutput,
): Promise<HandlerResult<Flow>> {
	const headers = {
		'x-telegram-id': telegramId.toString(),
		'x-user-key': userApiKey(),
	}

	const outcome =
		route === 'direct'
			? await buyDirect(headers, body)
			: await buySamechain(headers, body)

	await invalidateEnterBalances(telegramId, body)

	if (outcome.kind === 'failed') {
		throw await toEnterError(telegramId, body, outcome.message)
	}

	return toEnterSuccess(availablePreset, outcome.purchase)
}

/**
 * Stops at the sent transaction so the second frame can show it. Balances stay
 * untouched until the zap settles — invalidating here would refetch a balance
 * the in-flight entry is about to change again.
 */
async function sendCrosschainEnter(
	telegramId: number,
	body: BuyEntriesZapBodyDto,
	availablePreset: AvailablePresetDtoOutput,
): Promise<HandlerResult<Flow>> {
	const response = await callOrUnknown(() =>
		ripsControllerBuyEntriesZapCrosschain({
			headers: {
				'x-telegram-id': telegramId.toString(),
				'x-user-key': userApiKey(),
			},
			body,
		}),
	)

	if (response === null) {
		await invalidateEnterBalances(telegramId, body)

		throw await toEnterError(telegramId, body, unknownMessage(enterNouns))
	}

	const { zap } = response.data

	if (zap.status !== 'succeeded') {
		await invalidateEnterBalances(telegramId, body)

		throw await toEnterError(
			telegramId,
			body,
			failureMessage(zap, enterNouns),
		)
	}

	return {
		effect: {
			type: EffectType.LOADING,
			message: sentFrame(zap.transaction, NATIVE_ON_BASE.chain),
			next: () =>
				awaitCrosschainEnter(
					telegramId,
					body,
					availablePreset,
					zap.result.zapId,
					zap.transaction,
				),
		},
	}
}

async function awaitCrosschainEnter(
	telegramId: number,
	body: BuyEntriesZapBodyDto,
	availablePreset: AvailablePresetDtoOutput,
	zapId: string,
	srcTransaction: TransactionDtoOutput,
): Promise<HandlerResult<Flow>> {
	const result = await pollZapResult(zapId)

	await invalidateEnterBalances(telegramId, body)

	if (result.kind !== 'success') {
		throw await toEnterError(telegramId, body, result.message)
	}

	return toEnterSuccess(availablePreset, {
		ripId: result.success.ripId,
		entryCount: result.success.entryCount,
		startEntryIndex: result.success.startEntryIndex,
		transactions: {
			kind: 'crosschain',
			srcTransaction,
			dstTransaction: result.success.dstTransaction,
		},
	})
}

function toEnterError(
	telegramId: number,
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

async function buyDirect(
	headers: RipsControllerBuyEntriesPurchaseData['headers'],
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
	headers: RipsControllerBuyEntriesZapSamechainData['headers'],
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
