import { ChainAddressDto, usersControllerGetUser } from '@rips/api-client'
import { assertFlow, HandlerResult } from '@rips/grammy-kit'
import { ActionDef, noPayload, withPayload } from '../../action-def'
import { Flow, toStep } from '../../flows'
import { ZapCheckoutPage } from '../../pages/play/zap-checkout-page'
import { EffectType, SessionData } from '../../types'
import { fetchBalances, fetchPreset } from '../../utils/api/wrappers'
import { currencyChainAddressCodec } from '../../utils/currency'
import { evmAddressFromUser } from '../../utils/wallet'
import { ripsControllerQuoteZap } from './zap-api-stub'

async function buildZapCheckout(
	session: SessionData<Flow>,
	currencyChainAddress: ChainAddressDto,
): Promise<HandlerResult<Flow>> {
	assertFlow(
		session,
		'buyEntries',
		'entry-count-chosen',
		'zap-currency-chosen',
	)

	const { presetId, entryCount } = session.flow.data

	const [availablePreset, { data: zapQuote }, { data: user }] =
		await Promise.all([
			fetchPreset(presetId),
			ripsControllerQuoteZap({
				headers: { 'x-telegram-id': session.telegramId },
				body: {
					presetId,
					entryCount,
					paymentCurrencyChainAddress: currencyChainAddress,
				},
			}),
			usersControllerGetUser({
				path: { telegramId: session.telegramId },
			}),
		])

	const balances = await fetchBalances(session.telegramId, [
		currencyChainAddress,
		zapQuote.blockchainFee.currency.chainAddress,
	])

	const currencyInBalance = balances.find(
		(b) => b.currency.chainAddress.address === currencyChainAddress.address,
	)
	if (currencyInBalance === undefined)
		throw new Error('Currency in balance not found')

	const nativeBalance = balances.find(
		(b) => b.currency.id === zapQuote.blockchainFee.currency.id,
	)
	if (nativeBalance === undefined) throw new Error('Native balance not found')

	const flow = toStep(session.flow, 'zap-currency-chosen', {
		presetId,
		entryCount,
		currency: currencyInBalance.currency,
	})

	return {
		flow,
		effect: {
			type: EffectType.EDIT,
			page: ZapCheckoutPage.render({
				availablePreset,
				entryCount,
				currencyInBalance,
				nativeBalance,
				zapQuote,
				userEvmAddress: evmAddressFromUser(user),
			}),
		},
	}
}

export const openZapCheckout: ActionDef<ChainAddressDto> = withPayload(
	currencyChainAddressCodec,
	(session, currencyChainAddress) =>
		buildZapCheckout(session, currencyChainAddress),
)

export const refreshZapCheckout: ActionDef<void> = noPayload(
	async (session) => {
		assertFlow(session, 'buyEntries', 'zap-currency-chosen')

		return buildZapCheckout(
			session,
			session.flow.data.currency.chainAddress,
		)
	},
)
