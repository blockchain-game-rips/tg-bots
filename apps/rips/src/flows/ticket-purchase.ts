import type { HTTPError } from 'ky'
import {
	AvailableStakeDto,
	ripsControllerBuyTicketsPurchase,
	ripsControllerGetOngoingRounds,
	ripsControllerGetStakes,
	walletsControllerGetBalances,
} from '../../generated/api-client'
import { NATIVE_ON_BASE } from '../constants'
import { ChooseTicketAmountPage } from '../pages/content/choose-ticket-amount-page'
import { ConfirmPurchasePage } from '../pages/content/confirm-purchase-page'
import { InsufficientFundsPage } from '../pages/content/insufficient-funds-page'
import { SuccessPurchasePage } from '../pages/content/success-purchase-page'
import { getConfig } from '../pages/utils'
import { ActiveFlow, Context, PageContent, TicketPurchaseStep } from '../types'
import { ErrorToRender } from '../utils/error-to-render'
import { chainAddressToString } from '../utils/units'

const TRANSACTION_REVERTED_STATUS = 502

async function getAvailableStakeByIdOrThrow(
	stakeId: number,
): Promise<AvailableStakeDto> {
	const { data } = await ripsControllerGetStakes({ throwOnError: true })
	const stake = data.availableStakes.find((s) => s.stake.id === stakeId)

	if (stake === undefined) {
		throw new Error(`stakeId ${stakeId} is invalid`)
	}

	return stake
}

export async function enterTicketAmountStep(
	ctx: Context,
	stakeId: string,
): Promise<PageContent> {
	const stake = await getAvailableStakeByIdOrThrow(Number(stakeId))

	ctx.session = {
		activeFlow: ActiveFlow.TicketPurchase,
		stakeId,
		step: TicketPurchaseStep.ChoosingTicketAmount,
	}

	return ChooseTicketAmountPage.render(stake)
}

export async function enterConfirmingStep(
	ctx: Context,
	stakeId: string,
	ticketAmount: number,
): Promise<PageContent> {
	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = String(ctx.from.id)

	const [stake, { data: balancesData }] = await Promise.all([
		getAvailableStakeByIdOrThrow(Number(stakeId)),
		walletsControllerGetBalances({
			headers: { 'x-telegram-id': telegramId },
			query: { chainAddress: [chainAddressToString(NATIVE_ON_BASE)] },
			throwOnError: true,
		}),
	])

	const balance = balancesData.balances[0]

	if (balance === undefined) {
		throw new Error('No balance found for native asset')
	}

	const config = getConfig(stake)
	const totalCost = BigInt(config.ticketPrice.amount) * BigInt(ticketAmount)
	const balanceAmount = BigInt(balance.amount)

	if (balanceAmount < totalCost) {
		return InsufficientFundsPage.render(balance, stake, ticketAmount)
	}

	ctx.session = {
		activeFlow: ActiveFlow.TicketPurchase,
		step: TicketPurchaseStep.Confirming,
		ticketAmount,
		stakeId,
	}

	return ConfirmPurchasePage.render(stake, ticketAmount)
}

export async function enterBuyingStep(
	ctx: Context,
	stakeId: string,
	ticketAmount: number,
): Promise<PageContent> {
	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = String(ctx.from.id)

	const { data: purchase } = await ripsControllerBuyTicketsPurchase({
		headers: { 'x-telegram-id': telegramId },
		body: {
			stakeId: Number(stakeId),
			ticketCount: ticketAmount,
			paymentCurrencyChainAddress: NATIVE_ON_BASE,
		},
		throwOnError: true,
	}).catch((error: HTTPError) => {
		if (error.response?.status === TRANSACTION_REVERTED_STATUS) {
			throw new ErrorToRender(error.message)
		}

		throw error
	})

	const { data: roundsData } = await ripsControllerGetOngoingRounds({
		throwOnError: true,
	})

	const round = roundsData.rounds.find((r) => r.id === purchase.roundId)

	ctx.session = { activeFlow: null }

	return SuccessPurchasePage.render(purchase, round)
}
