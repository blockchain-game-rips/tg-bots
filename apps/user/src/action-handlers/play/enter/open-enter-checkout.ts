import {
	AvailablePresetDtoOutput,
	ChainAddressDtoOutput,
	CurrencyAmountDtoOutput,
	ripsControllerQuotePurchase,
	ripsControllerQuoteZapCrosschain,
	ripsControllerQuoteZapSamechain,
} from '@rips/api-client'
import { assertFlow } from '@rips/grammy-kit'
import { resolveConfig } from '@rips/shared'
import { ActionDef, noPayload, withPayload } from '../../../action-def'
import { resolvePaymentRoute } from '../../../domain/payment-route'
import { Flow, toFlow } from '../../../flows'
import { CheckoutPage, CheckoutQuote } from '../../../pages/play/checkout-page'
import { EffectType, HandlerResult } from '../../../types'
import { fetchSingleBalance, getBalance } from '../../../utils/api/wrappers'
import { entryCountCodec } from '../../../utils/codecs'
import {
	currencyChainAddressCodec,
	isSameChainAddress,
} from '../../../utils/currency'

interface CheckoutDraft {
	availablePreset: AvailablePresetDtoOutput
	entryCount: number
	balances: CurrencyAmountDtoOutput[]
	payCurrencyBalance: CurrencyAmountDtoOutput
}

export const openEnterCheckout: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'enter', 'at-checkout')

	return renderCheckout(session.telegramId, session.flow.data)
})

export const openEnterCheckoutFromPaymentToken: ActionDef<ChainAddressDtoOutput> =
	withPayload(currencyChainAddressCodec, (session, payChainAddress) => {
		assertFlow(session, 'enter', 'choosing-payment-token', 'at-checkout')

		const { availablePreset, entryCount, balances } = session.flow.data

		return renderCheckout(session.telegramId, {
			availablePreset,
			entryCount,
			balances,
			payCurrencyBalance: getBalance(balances, payChainAddress),
		})
	})

export const openEnterCheckoutFromEntryCount: ActionDef<number> = withPayload(
	entryCountCodec,
	(session, entryCount) => {
		assertFlow(session, 'enter', 'at-checkout')

		const { availablePreset, balances, payCurrencyBalance } =
			session.flow.data

		return renderCheckout(session.telegramId, {
			availablePreset,
			entryCount,
			balances,
			payCurrencyBalance,
		})
	},
)

async function renderCheckout(
	telegramId: string,
	draft: CheckoutDraft,
): Promise<HandlerResult<Flow>> {
	const { availablePreset, entryCount, balances, payCurrencyBalance } = draft

	const quote = await fetchCheckoutQuote(telegramId, draft)

	const nativeBalance = await resolveFeeBalance(
		telegramId,
		balances,
		quote.quote.blockchainFee.currency.chainAddress,
	)

	return {
		flow: toFlow('enter', 'at-checkout', draft),
		effect: {
			type: EffectType.EDIT,
			page: CheckoutPage.render({
				availablePreset,
				entryCount,
				srcBalance: payCurrencyBalance,
				nativeBalance,
				quote,
			}),
		},
	}
}

// The quote picks which currency pays the network fee. It is normally already
// in the cached balances, but a fee currency outside the cached set still has
// to render rather than throw.
async function resolveFeeBalance(
	telegramId: string,
	balances: CurrencyAmountDtoOutput[],
	feeChainAddress: ChainAddressDtoOutput,
): Promise<CurrencyAmountDtoOutput> {
	const cached = balances.find((balance) =>
		isSameChainAddress(balance.currency.chainAddress, feeChainAddress),
	)

	return cached ?? fetchSingleBalance(telegramId, feeChainAddress)
}

async function fetchCheckoutQuote(
	telegramId: string,
	draft: CheckoutDraft,
): Promise<CheckoutQuote> {
	const { availablePreset, entryCount, payCurrencyBalance } = draft

	const payChainAddress = payCurrencyBalance.currency.chainAddress

	const headers = { 'x-telegram-id': telegramId }
	const body = {
		presetId: availablePreset.preset.id,
		entryCount,
		paymentCurrencyChainAddress: payChainAddress,
	}

	const route = resolvePaymentRoute(payChainAddress)

	if (route === 'direct') {
		const { data } = await ripsControllerQuotePurchase({ headers, body })

		return {
			kind: 'direct',
			amountIn: entryTotal(availablePreset, entryCount),
			quote: data,
		}
	}

	if (route === 'samechain') {
		const { data } = await ripsControllerQuoteZapSamechain({
			headers,
			body,
		})

		return { kind: 'samechain', quote: data }
	}

	const { data } = await ripsControllerQuoteZapCrosschain({ headers, body })

	return { kind: 'crosschain', quote: data }
}

function entryTotal(
	availablePreset: AvailablePresetDtoOutput,
	entryCount: number,
): CurrencyAmountDtoOutput {
	const { entryPrice } = resolveConfig(availablePreset)

	const total = BigInt(entryPrice.amount) * BigInt(entryCount)

	return { amount: total.toString(), currency: entryPrice.currency }
}
