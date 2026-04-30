import {
	CurrencyAmountDto,
	CurrencyDto,
	UserDtoOutput,
	walletsControllerGetBalances,
	walletsControllerQuoteWithdraw,
} from '../../generated/api-client'
import { EIP155_NAMESPACE } from '../constants'
import { WithdrawCheckoutPage } from '../pages/wallet/withdraw-checkout-page'
import { WithdrawPage } from '../pages/wallet/withdraw-page'
import { Effect, EffectType } from '../types'
import { toCurrencyId } from './currency'

export function evmAddressFromUser(user: UserDtoOutput) {
	const userEvmAddress = user.wallets[EIP155_NAMESPACE]

	if (userEvmAddress === undefined) {
		throw new Error('User has no EVM wallet')
	}

	return userEvmAddress
}

export async function resolveWithdrawPage(
	telegramId: string,
	currency: CurrencyDto,
	currencyAmount: CurrencyAmountDto | undefined,
	recipientAddress: string | undefined,
): Promise<Effect> {
	if (currencyAmount === undefined || recipientAddress === undefined) {
		const { data: balancesData } = await walletsControllerGetBalances({
			headers: { 'x-telegram-id': telegramId },
			query: { chainAddress: [toCurrencyId(currency.chainAddress)] },
		})

		const currencyBalance = balancesData.balances[0]

		return {
			type: EffectType.EDIT,
			page: WithdrawPage.render(
				currencyBalance,
				currencyAmount,
				recipientAddress,
			),
		}
	}

	const { data: withdrawQuote } = await walletsControllerQuoteWithdraw({
		headers: { 'x-telegram-id': telegramId },
		body: {
			amountIn: {
				currencyChainAddress: currency.chainAddress,
				amount: currencyAmount.amount.toString(),
			},
			currencyOutChainAddress: currency.chainAddress,
			recipientAddress,
		},
	})

	const { data: balancesData } = await walletsControllerGetBalances({
		headers: { 'x-telegram-id': telegramId },
		query: {
			chainAddress: [
				toCurrencyId(currency.chainAddress),
				toCurrencyId(withdrawQuote.blockchainFee.currency.chainAddress),
			],
		},
	})

	const nativeBalance = balancesData.balances.find(
		(balance) =>
			balance.currency.id === withdrawQuote.blockchainFee.currency.id,
	)!

	const currencyBalance = balancesData.balances.find(
		(balance) => balance.currency.id === currency.id,
	)!

	return {
		type: EffectType.EDIT,
		page: WithdrawCheckoutPage.render({
			currencyAmount,
			currencyBalance,
			nativeBalance,
			recipientAddress,
			withdrawQuote,
		}),
	}
}
