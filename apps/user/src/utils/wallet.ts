import {
	CurrencyDto,
	UserDtoOutput,
	walletsControllerQuoteWithdraw,
} from '@rips/api-client'
import { EIP155_NAMESPACE } from '../constants'
import { WithdrawPage } from '../pages/wallet/withdraw-page'
import { Effect, EffectType } from '../types'
import { fetchBalances, getBalance } from './api/wrappers'

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
	amount: bigint | undefined,
	recipientAddress: string | undefined,
): Promise<Effect> {
	if (amount === undefined || recipientAddress === undefined) {
		const balances = await fetchBalances(telegramId, [
			currency.chainAddress,
		])

		const currencyBalance = getBalance(balances, currency.chainAddress)

		return {
			type: EffectType.EDIT,
			page: WithdrawPage.render({
				kind: 'pending',
				currencyBalance,
				amount,
				recipientAddress,
			}),
		}
	}

	const { data: withdrawQuote } = await walletsControllerQuoteWithdraw({
		headers: { 'x-telegram-id': telegramId },
		body: {
			amountIn: {
				currencyChainAddress: currency.chainAddress,
				amount: amount.toString(),
			},
			currencyOutChainAddress: currency.chainAddress,
			recipientAddress,
		},
	})

	const balances = await fetchBalances(telegramId, [
		currency.chainAddress,
		withdrawQuote.blockchainFee.currency.chainAddress,
	])

	const nativeBalance = getBalance(
		balances,
		withdrawQuote.blockchainFee.currency.chainAddress,
	)

	const currencyBalance = getBalance(balances, currency.chainAddress)

	return {
		type: EffectType.EDIT,
		page: WithdrawPage.render({
			kind: 'quoted',
			amount,
			currencyBalance,
			nativeBalance,
			recipientAddress,
			withdrawQuote,
		}),
	}
}
