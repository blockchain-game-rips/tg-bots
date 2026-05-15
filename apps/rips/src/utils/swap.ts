import {
	CurrencyDto,
	usersControllerGetUser,
	walletsControllerQuoteSwap,
} from '../../generated/api-client'
import { setFlow } from '../grammy-kit/session/session-utils'
import { SwapCheckoutPage } from '../pages/wallet/swap-checkout'
import { SwapPage } from '../pages/wallet/swap-page'
import { Effect, EffectType, SessionData } from '../types'
import { fetchBalances } from './api'
import { toCurrencyAmount, toCurrencyId } from './currency'
import { evmAddressFromUser } from './wallet'

export interface SwapState {
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

	const balances = await fetchBalances(session.telegramId, [
		toCurrencyId(currencyIn.chainAddress),
		toCurrencyId(swapQuote.blockchainFee.currency.chainAddress),
		toCurrencyId(currencyOut.chainAddress),
	])

	const currencyInBalance = balances.find(
		(b) => b.currency.id === currencyIn.id,
	)
	if (currencyInBalance === undefined)
		throw new Error('Currency in balance not found')

	const nativeInBalance = balances.find(
		(b) => b.currency.id === swapQuote.blockchainFee.currency.id,
	)
	if (nativeInBalance === undefined)
		throw new Error('Native in balance not found')

	const currencyOutBalance = balances.find(
		(b) => b.currency.id === currencyOut.id,
	)
	if (currencyOutBalance === undefined)
		throw new Error('Currency out balance not found')

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

	const balances = await fetchBalances(session.telegramId, currencyIds)

	const currencyInBalance = currencyIn
		? balances.find((b) => b.currency.id === currencyIn.id)
		: undefined

	const currencyOutBalance = currencyOut
		? balances.find((b) => b.currency.id === currencyOut.id)
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
			quotedAmountOut: checkout.swapQuote.amountOut,
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
		currencyInBalance !== undefined &&
		amountIn !== undefined &&
		currencyIn !== undefined
			? toCurrencyAmount(amountIn, currencyIn)
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
