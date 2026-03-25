import { ApiError } from '../api/client'
import { getMainCurrencyPrice } from '../api/endpoints/price'
import { buyTickets, getStakes } from '../api/endpoints/rips'
import { getBalance } from '../api/endpoints/wallets'
import { ChooseTicketAmountPage } from '../pages/content/choose-ticket-amount-page'
import { ConfirmPurchasePage } from '../pages/content/confirm-purchase-page'
import { InsufficientFundsPage } from '../pages/content/insufficient-funds-page'
import { SuccessPurchasePage } from '../pages/content/success-purchase-page'
import { ActiveFlow, Context, PageContent, TicketPurchaseStep } from '../types'
import { ErrorToRender } from '../utils/error-to-render'
import { calcAvailableBalance } from '../utils/tx'

const TRANSACTION_REVERTED_STATUS = 502

async function getStakeByIdOrThrow(stakeId: number) {
	const stakes = await getStakes()
	const stake = stakes.find((s) => s.id === stakeId)

	if (stake === undefined) {
		throw new Error(`stakeId ${stakeId} is invalid`)
	}

	return stake
}

export async function enterTicketAmountStep(
	ctx: Context,
	stakeId: string,
): Promise<PageContent> {
	const [stake, { price }] = await Promise.all([
		getStakeByIdOrThrow(Number(stakeId)),
		getMainCurrencyPrice(),
	])

	ctx.session = {
		activeFlow: ActiveFlow.TicketPurchase,
		stakeId,
		step: TicketPurchaseStep.ChoosingTicketAmount,
	}

	return ChooseTicketAmountPage.render(stake, price)
}

export async function enterConfirmingStep(
	ctx: Context,
	stakeId: string,
	ticketAmount: number,
): Promise<PageContent> {
	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = BigInt(ctx.from.id)

	const [stake, balance, { price }] = await Promise.all([
		getStakeByIdOrThrow(Number(stakeId)),
		getBalance(telegramId),
		getMainCurrencyPrice(),
	])

	const totalCostRaw = BigInt(stake.ticketPrice.amount) * BigInt(ticketAmount)
	const balanceRaw = BigInt(balance.amount)
	const availableBalance = calcAvailableBalance(balanceRaw)

	if (availableBalance < totalCostRaw) {
		return InsufficientFundsPage.render(stake, ticketAmount, balance, price)
	}

	ctx.session = {
		activeFlow: ActiveFlow.TicketPurchase,
		step: TicketPurchaseStep.Confirming,
		ticketAmount,
		stakeId,
	}

	return ConfirmPurchasePage.render(stake, ticketAmount, price)
}

export async function enterBuyingStep(
	ctx: Context,
	stakeId: string,
	ticketAmount: number,
): Promise<PageContent> {
	if (ctx.from === undefined) {
		throw new Error('ctx.from is undefined')
	}

	const telegramId = BigInt(ctx.from.id)

	const [stake, { price }] = await Promise.all([
		getStakeByIdOrThrow(Number(stakeId)),
		getMainCurrencyPrice(),
	])

	const purchase = await buyTickets(telegramId, stake.id, ticketAmount).catch(
		(error) => {
			if (
				error instanceof ApiError &&
				error.status === TRANSACTION_REVERTED_STATUS
			) {
				throw new ErrorToRender(error.message)
			}

			throw error
		},
	)

	ctx.session = { activeFlow: null }

	return SuccessPurchasePage.render(stake, purchase, price)
}
