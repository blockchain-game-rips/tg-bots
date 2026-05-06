import {
	CurrencyAmountDto,
	CurrencyDto,
	UserDtoOutput,
	usersControllerGetUser,
	walletsControllerQuoteWithdraw,
} from '../../generated/api-client'
import { EIP155_NAMESPACE } from '../constants'
import { WithdrawCheckoutPage } from '../pages/wallet/withdraw-checkout-page'
import { WithdrawPage } from '../pages/wallet/withdraw-page'
import { Effect, EffectType } from '../types'
import { fetchBalances } from './api'
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
		const balances = await fetchBalances(telegramId, [
			toCurrencyId(currency.chainAddress),
		])

		const currencyBalance = balances[0]

		return {
			type: EffectType.EDIT,
			page: WithdrawPage.render(
				currencyBalance,
				currencyAmount,
				recipientAddress,
			),
		}
	}

	const [{ data: withdrawQuote }, { data: user }] = await Promise.all([
		walletsControllerQuoteWithdraw({
			headers: { 'x-telegram-id': telegramId },
			body: {
				amountIn: {
					currencyChainAddress: currency.chainAddress,
					amount: currencyAmount.amount.toString(),
				},
				currencyOutChainAddress: currency.chainAddress,
				recipientAddress,
			},
		}),
		usersControllerGetUser({ path: { telegramId } }),
	])

	const balances = await fetchBalances(telegramId, [
		toCurrencyId(currency.chainAddress),
		toCurrencyId(withdrawQuote.blockchainFee.currency.chainAddress),
	])

	const nativeBalance = balances.find(
		(balance) =>
			balance.currency.id === withdrawQuote.blockchainFee.currency.id,
	)!

	const currencyBalance = balances.find(
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
			userEvmAddress: evmAddressFromUser(user),
		}),
	}
}
