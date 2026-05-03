import {
	CurrencyAmountDto,
	CurrencyDto,
	usersControllerGetUser,
	walletsControllerGetBalances,
	walletsControllerQuoteSwap,
} from '../../generated/api-client'
import { SwapCheckoutPage } from '../pages/wallet/swap-checkout'
import { SwapPage } from '../pages/wallet/swap-page'
import { Effect, EffectType, SessionData } from '../types'
import { toCurrencyAmount, toCurrencyId } from './currency'
import { setFlow } from './session-utils'
import { evmAddressFromUser } from './wallet'

export type SwapState = {
	currencyIn?: CurrencyDto
	currencyOut?: CurrencyDto
	amountIn?: bigint
}

async function fetchCheckout(
	session: SessionData,
	currencyIn: CurrencyDto,
	currencyOut: CurrencyDto,
	amountIn: bigint,
) {
	const [{ data: swapQuote }, { data: user }] = await Promise.all([
		walletsControllerQuoteSwap({
			headers: { 'x-telegram-id': session.telegramId },
			body: {
				tokenInChainAddress: currencyIn.chainAddress,
				tokenOutChainAddress: currencyOut.chainAddress,
				amountIn: amountIn.toString(),
			},
		}),
		usersControllerGetUser({ path: { telegramId: session.telegramId } }),
	])

	const { data: balancesData } = await walletsControllerGetBalances({
		headers: { 'x-telegram-id': session.telegramId },
		query: {
			chainAddress: [
				toCurrencyId(currencyIn.chainAddress),
				toCurrencyId(swapQuote.blockchainFee.currency.chainAddress),
				toCurrencyId(currencyOut.chainAddress),
			],
		},
	})

	const currencyInBalance = balancesData.balances.find(
		(b) => b.currency.id === currencyIn.id,
	)!
	const nativeInBalance = balancesData.balances.find(
		(b) => b.currency.id === swapQuote.blockchainFee.currency.id,
	)!
	const currencyOutBalance = balancesData.balances.find(
		(b) => b.currency.id === currencyOut.id,
	)!

	return {
		swapQuote,
		currencyInBalance,
		nativeInBalance,
		currencyOutBalance,
		userEvmAddress: evmAddressFromUser(user),
	}
}

async function fetchHub(
	session: SessionData,
	currencyIn: CurrencyDto | undefined,
	currencyOut: CurrencyDto | undefined,
) {
	const currencyIds = [
		currencyIn ? toCurrencyId(currencyIn.chainAddress) : undefined,
		currencyOut ? toCurrencyId(currencyOut.chainAddress) : undefined,
	].filter((id): id is string => id !== undefined)

	if (currencyIds.length === 0) {
		return { currencyInBalance: undefined, currencyOutBalance: undefined }
	}

	const { data: balancesData } = await walletsControllerGetBalances({
		headers: { 'x-telegram-id': session.telegramId },
		query: { chainAddress: currencyIds },
	})

	const currencyInBalance = currencyIn
		? balancesData.balances.find((b) => b.currency.id === currencyIn.id)
		: undefined

	const currencyOutBalance = currencyOut
		? balancesData.balances.find((b) => b.currency.id === currencyOut.id)
		: undefined

	return { currencyInBalance, currencyOutBalance }
}

export async function resolveSwapPage(
	session: SessionData,
	state: SwapState,
): Promise<Effect> {
	const { currencyIn, currencyOut, amountIn } = state

	// quotedAmountOut is intentionally dropped — any token or amount change invalidates it
	setFlow(session, 'swap', 'idle', { currencyIn, currencyOut, amountIn })

	if (
		currencyIn !== undefined &&
		currencyOut !== undefined &&
		amountIn !== undefined
	) {
		const checkout = await fetchCheckout(
			session,
			currencyIn,
			currencyOut,
			amountIn,
		)

		setFlow(session, 'swap', 'idle', {
			currencyIn,
			currencyOut,
			amountIn,
			quotedAmountOut: checkout.swapQuote.amountOut as CurrencyAmountDto,
		})

		return {
			type: EffectType.EDIT,
			page: SwapCheckoutPage.render({
				amountIn: toCurrencyAmount(amountIn, currencyIn),
				...checkout,
			}),
		}
	}

	const { currencyInBalance, currencyOutBalance } = await fetchHub(
		session,
		currencyIn,
		currencyOut,
	)

	const amountInDisplay =
		currencyInBalance !== undefined && amountIn !== undefined
			? toCurrencyAmount(amountIn, currencyIn!)
			: undefined

	return {
		type: EffectType.EDIT,
		page: SwapPage.render({
			currencyInBalance,
			currencyOutBalance,
			amountIn: amountInDisplay,
		}),
	}
}
