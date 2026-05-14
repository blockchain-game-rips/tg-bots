import {
	ChainAddressDto,
	ripsControllerQuoteZap,
	usersControllerGetUser,
} from '../../../generated/api-client'
import { ActionDef, noPayload, withPayload } from '../../action-def'
import { ZapCheckoutPage } from '../../pages/play/zap-checkout-page'
import { Effect, EffectType, SessionData } from '../../types'
import { fetchBalances, fetchStake } from '../../utils/api'
import { findCurrencyIndex, toCurrencyId } from '../../utils/currency'
import { assertFlow, setFlowStep } from '../../utils/session-utils'
import { evmAddressFromUser } from '../../utils/wallet'
import { parseCurrencyChainAddress } from '../../validation/currency-index'

async function buildZapCheckout(
	session: SessionData,
	currencyChainAddress: ChainAddressDto,
): Promise<Effect> {
	assertFlow(
		session,
		'buyTickets',
		'ticket-count-chosen',
		'zap-currency-chosen',
	)

	const { stakeId, ticketCount } = session.flow.data

	const [availableStake, { data: zapQuote }, { data: user }] =
		await Promise.all([
			fetchStake(stakeId),
			ripsControllerQuoteZap({
				headers: { 'x-telegram-id': session.telegramId },
				body: {
					stakeId,
					ticketCount,
					paymentCurrencyChainAddress: currencyChainAddress,
				},
			}),
			usersControllerGetUser({
				path: { telegramId: session.telegramId },
			}),
		])

	const balances = await fetchBalances(session.telegramId, [
		toCurrencyId(currencyChainAddress),
		toCurrencyId(zapQuote.blockchainFee.currency.chainAddress),
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

	setFlowStep(session, 'zap-currency-chosen', {
		stakeId,
		ticketCount,
		currency: currencyInBalance.currency,
	})

	return {
		type: EffectType.EDIT,
		page: ZapCheckoutPage.render({
			availableStake,
			ticketCount,
			currencyInBalance,
			nativeBalance,
			zapQuote,
			userEvmAddress: evmAddressFromUser(user),
		}),
	}
}

export const openZapCheckout: ActionDef<ChainAddressDto> = withPayload(
	(currencyChainAddress) =>
		findCurrencyIndex(currencyChainAddress).toString(),
	(raw) => parseCurrencyChainAddress(raw),
	(session, currencyChainAddress) =>
		buildZapCheckout(session, currencyChainAddress),
)

export const refreshZapCheckout: ActionDef<void> = noPayload(
	async (session) => {
		assertFlow(session, 'buyTickets', 'zap-currency-chosen')

		return buildZapCheckout(
			session,
			session.flow.data.currency.chainAddress,
		)
	},
)
