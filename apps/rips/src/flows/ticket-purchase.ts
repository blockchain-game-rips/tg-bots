import { getBalance } from '../api/endpoints/wallets'
import { getStakes } from '../api/endpoints/rips'
import { ChooseTicketAmountPage } from '../pages/content/choose-ticket-amount-page'
import { ConfirmPurchasePage } from '../pages/content/confirm-purchase-page'
import { InsufficientFundsPage } from '../pages/content/insufficient-funds-page'
import { ActiveFlow, Context, PageContent, TicketPurchaseStep } from '../types'

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
	const stake = await getStakeByIdOrThrow(Number(stakeId))

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

	const telegramId = BigInt(ctx.from.id)

	const [stake, balance] = await Promise.all([
		getStakeByIdOrThrow(Number(stakeId)),
		getBalance(telegramId),
	])

	const totalCostRaw = BigInt(stake.ticketPrice.amount) * BigInt(ticketAmount)
	const balanceRaw = BigInt(balance.amount)

	//TODO: also check gas
	if (balanceRaw < totalCostRaw) {
		return InsufficientFundsPage.render(stake, ticketAmount, balance)
	}

	ctx.session = {
		activeFlow: ActiveFlow.TicketPurchase,
		step: TicketPurchaseStep.Confirming,
		ticketAmount,
		stakeId,
	}

	return ConfirmPurchasePage.render(stake, ticketAmount)
}
