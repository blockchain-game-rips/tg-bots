import {
	ripsControllerQuoteZap,
	usersControllerGetUser,
	walletsControllerGetBalances,
} from '../../../generated/api-client'
import { ZapConfirmPage } from '../../pages/play/zap-confirm-page'
import { Effect, EffectType, SessionData } from '../../types'
import { fetchStake } from '../../utils/api'
import { toCurrencyId } from '../../utils/currency'
import { assertFlow, setFlowStep } from '../../utils/session-utils'
import { evmAddressFromUser } from '../../utils/wallet'
import { parseCurrencyChainAddress } from '../../validation/currency-index'

export async function showZapConfirm(
	session: SessionData,
	payload: string | undefined,
): Promise<Effect> {
	assertFlow(session, 'buyTickets', 'zap-chain-chosen', 'zap-currency-chosen')

	const { stakeId, ticketCount } = session.flow.data

	const currencyChainAddress =
		session.flow.step === 'zap-currency-chosen'
			? session.flow.data.currency.chainAddress
			: parseCurrencyChainAddress(payload)

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

	const { data: balancesData } = await walletsControllerGetBalances({
		headers: { 'x-telegram-id': session.telegramId },
		query: {
			chainAddress: [
				toCurrencyId(currencyChainAddress),
				toCurrencyId(zapQuote.blockchainFee.currency.chainAddress),
			],
		},
	})

	const currencyInBalance = balancesData.balances.find(
		(b) => b.currency.chainAddress.address === currencyChainAddress.address,
	)!

	const nativeBalance = balancesData.balances.find(
		(b) => b.currency.id === zapQuote.blockchainFee.currency.id,
	)!

	setFlowStep(session, 'zap-currency-chosen', {
		stakeId,
		ticketCount,
		currency: currencyInBalance.currency,
	})

	return {
		type: EffectType.EDIT,
		page: ZapConfirmPage.render({
			availableStake,
			ticketCount,
			currencyInBalance,
			nativeBalance,
			zapQuote,
			userEvmAddress: evmAddressFromUser(user),
		}),
	}
}
