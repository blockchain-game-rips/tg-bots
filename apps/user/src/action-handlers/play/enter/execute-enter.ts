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
} from '@rips/api-client'
import { assertFlow, ErrorToRender, fmt, wait } from '@rips/grammy-kit'
import { resolveConfig } from '@rips/shared'
import { ActionDef, noPayload } from '../../../action-def'
import { resolvePaymentRoute } from '../../../domain/payment-route'
import { Flow, toReset } from '../../../flows'
import {
	EnterSuccessArgs,
	EnterSuccessPage,
} from '../../../pages/play/enter-success-page'
import { EffectType, HandlerResult } from '../../../types'
import { fetchRip } from '../../../utils/api/wrappers'
import { TransactionOutcome } from '../../../utils/display/transaction-outcome'

const ZAP_POLL_INTERVAL_MS = 2000
const ZAP_POLL_TIMEOUT_MS = 60000

type ZapSuccess = NonNullable<GetZapResultResponseDtoOutput['success']>

/** The parts of a buy response every route returns. */
interface PurchaseOutcome {
	ripId: number
	entryCount: number
	startEntryIndex: number
	transactions: TransactionOutcome
}

export const executeEnter: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'enter', 'at-checkout')

	const { availablePreset, entryCount, payCurrencyBalance } =
		session.flow.data

	const body: BuyEntriesZapBodyDto = {
		presetId: availablePreset.preset.id,
		entryCount,
		paymentCurrencyChainAddress: payCurrencyBalance.currency.chainAddress,
	}

	return {
		effect: {
			type: EffectType.LOADING,
			message: fmt`Entering...`,
			next: () =>
				executeEnterRequest(session.telegramId, availablePreset, body),
		},
	}
})

async function executeEnterRequest(
	telegramId: string,
	availablePreset: AvailablePresetDtoOutput,
	body: BuyEntriesZapBodyDto,
): Promise<HandlerResult<Flow>> {
	const headers = { 'x-telegram-id': telegramId }

	const outcome = await buyEntries(
		resolvePaymentRoute(body.paymentCurrencyChainAddress),
		headers,
		body,
	)

	return {
		flow: toReset(),
		effect: {
			type: EffectType.NAVIGATE,
			page: EnterSuccessPage.render(
				await toSuccessArgs(availablePreset, outcome),
			),
		},
	}
}

async function buyEntries(
	route: ReturnType<typeof resolvePaymentRoute>,
	headers: TelegramIdHeaderDto,
	body: BuyEntriesZapBodyDto,
): Promise<PurchaseOutcome> {
	if (route === 'direct') return buyDirect(headers, body)

	if (route === 'samechain') return buySamechain(headers, body)

	return buyCrosschain(headers, body)
}

async function buyDirect(
	headers: TelegramIdHeaderDto,
	body: BuyEntriesZapBodyDto,
): Promise<PurchaseOutcome> {
	const { data } = await ripsControllerBuyEntriesPurchase({ headers, body })

	return {
		...data,
		transactions: {
			kind: 'singleChain',
			transaction: data.transaction,
		},
	}
}

async function buySamechain(
	headers: TelegramIdHeaderDto,
	body: BuyEntriesZapBodyDto,
): Promise<PurchaseOutcome> {
	const { data } = await ripsControllerBuyEntriesZapSamechain({
		headers,
		body,
	})

	return {
		...data,
		transactions: {
			kind: 'singleChain',
			transaction: data.transaction,
		},
	}
}

async function buyCrosschain(
	headers: TelegramIdHeaderDto,
	body: BuyEntriesZapBodyDto,
): Promise<PurchaseOutcome> {
	const { data: submit } = await ripsControllerBuyEntriesZapCrosschain({
		headers,
		body,
	})

	const result = await pollZapResult(submit.zapId)

	return {
		ripId: result.ripId,
		entryCount: result.entryCount,
		startEntryIndex: result.startEntryIndex,
		transactions: {
			kind: 'crosschain',
			srcTransaction: submit.srcTransaction,
			dstTransaction: result.dstTransaction,
		},
	}
}

async function pollZapResult(zapId: string): Promise<ZapSuccess> {
	const deadline = Date.now() + ZAP_POLL_TIMEOUT_MS

	while (Date.now() < deadline) {
		const { data } = await ripsControllerGetZapResult({ query: { zapId } })

		if (data.success !== null) return data.success

		if (data.pending === null) throw new ErrorToRender('Entry failed')

		await wait(ZAP_POLL_INTERVAL_MS)
	}

	throw new ErrorToRender('Entry timed out')
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
