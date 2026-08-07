import { ChainAddressDtoOutput } from '@rips/api-client'
import { assertFlow, HandlerResult } from '@rips/grammy-kit'
import { ActionDef, noPayload, withPayload } from '../../../action-def'
import { Flow, toStep } from '../../../flows'
import { CheckoutPage } from '../../../pages/play/checkout-page'
import { EffectType, SessionData } from '../../../types'
import { fetchBalances, getBalance } from '../../../utils/api/wrappers'
import { currencyChainAddressCodec } from '../../../utils/currency'
import { ripsControllerQuoteZap } from './zap-api-stub'

async function buildZapCheckout(
	session: SessionData<Flow>,
	currencyChainAddress: ChainAddressDtoOutput,
): Promise<HandlerResult<Flow>> {
	assertFlow(session, 'enter', 'choosing-payment-token', 'at-checkout')

	const { availablePreset, entryCount } = session.flow.data

	const { data: zapQuote } = await ripsControllerQuoteZap({
		headers: { 'x-telegram-id': session.telegramId },
		body: {
			presetId: availablePreset.preset.id,
			entryCount,
			paymentCurrencyChainAddress: currencyChainAddress,
		},
	})

	const balances = await fetchBalances(session.telegramId, [
		currencyChainAddress,
		zapQuote.blockchainFee.currency.chainAddress,
	])

	const payCurrencyBalance = getBalance(balances, currencyChainAddress)

	const nativeBalance = getBalance(
		balances,
		zapQuote.blockchainFee.currency.chainAddress,
	)

	const flow = toStep(session.flow, 'at-checkout', {
		availablePreset,
		entryCount,
		balances,
		payCurrencyBalance,
	})

	return {
		flow,
		effect: {
			type: EffectType.EDIT,
			// TODO: choose samechain vs crosschain quote based on the
			// payment chain (Base = samechain), and call the matching
			// quote endpoint. Only crosschain is wired for now.
			page: CheckoutPage.render({
				availablePreset,
				entryCount,
				srcBalance: payCurrencyBalance,
				nativeBalance,
				quote: { kind: 'crosschain', quote: zapQuote },
			}),
		},
	}
}

export const openZapCheckout: ActionDef<ChainAddressDtoOutput> = withPayload(
	currencyChainAddressCodec,
	(session, currencyChainAddress) =>
		buildZapCheckout(session, currencyChainAddress),
)

export const refreshZapCheckout: ActionDef<void> = noPayload(
	async (session) => {
		assertFlow(session, 'enter', 'at-checkout')

		return buildZapCheckout(
			session,
			session.flow.data.payCurrencyBalance.currency.chainAddress,
		)
	},
)
