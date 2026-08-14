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
import { balanceCache } from '../../../cache/balance-cache'
import { presetCache } from '../../../cache/preset-cache'
import { NATIVE_ON_BASE, withNative } from '../../../constants'
import { resolvePaymentRoute } from '../../../domain/payment-route'
import { Flow, toFlow } from '../../../flows'
import { CheckoutPage, CheckoutQuote } from '../../../pages/play/checkout-page'
import { EffectType, HandlerResult } from '../../../types'
import { entryCountCodec } from '../../../utils/codecs'
import { currencyChainAddressCodec } from '../../../utils/currency'

/** Only what the user chose — every balance is read fresh at render time. */
interface CheckoutDraft {
	presetId: number
	entryCount: number
	payChainAddress: ChainAddressDtoOutput
}

export const openEnterCheckout: ActionDef<void> = noPayload((session) => {
	assertFlow(session, 'enter', 'at-checkout')

	return renderCheckout(session.telegramId, session.flow.data)
})

export const openEnterCheckoutFromPaymentToken: ActionDef<ChainAddressDtoOutput> =
	withPayload(currencyChainAddressCodec, (session, payChainAddress) => {
		assertFlow(session, 'enter', 'choosing-payment-token', 'at-checkout')

		const { presetId, entryCount } = session.flow.data

		return renderCheckout(session.telegramId, {
			presetId,
			entryCount,
			payChainAddress,
		})
	})

export const openEnterCheckoutFromEntryCount: ActionDef<number> = withPayload(
	entryCountCodec,
	(session, entryCount) => {
		assertFlow(session, 'enter', 'at-checkout')

		const { presetId, payChainAddress } = session.flow.data

		return renderCheckout(session.telegramId, {
			presetId,
			entryCount,
			payChainAddress,
		})
	},
)

/**
 * Lets the user force fresh balances when they know something the bot cannot:
 * a deposit made outside it, which nothing else here would notice until the
 * cached balance expires.
 */
export const refreshEnterCheckout: ActionDef<void> = noPayload(
	async (session) => {
		assertFlow(session, 'enter', 'at-checkout')

		const { payChainAddress } = session.flow.data

		await balanceCache.invalidate(session.telegramId, [
			...withNative(payChainAddress),
			NATIVE_ON_BASE,
		])

		return renderCheckout(session.telegramId, session.flow.data)
	},
)

/**
 * Reads balances through the cache on every render, so a replay of this handler
 * from the back trail cannot show what the balances were when it first ran.
 */
async function renderCheckout(
	telegramId: string,
	draft: CheckoutDraft,
): Promise<HandlerResult<Flow>> {
	const { presetId, entryCount, payChainAddress } = draft

	const availablePreset = await presetCache.getOne(presetId)

	const quote = await fetchCheckoutQuote(telegramId, availablePreset, draft)

	const [payCurrencyBalance, nativeBalance] = await balanceCache.getPair(
		telegramId,
		payChainAddress,
		quote.quote.blockchainFee.currency.chainAddress,
	)

	return {
		flow: toFlow('enter', 'at-checkout', draft),
		effect: {
			type: EffectType.NAVIGATE,
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

async function fetchCheckoutQuote(
	telegramId: string,
	availablePreset: AvailablePresetDtoOutput,
	draft: CheckoutDraft,
): Promise<CheckoutQuote> {
	const { entryCount, payChainAddress } = draft

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
