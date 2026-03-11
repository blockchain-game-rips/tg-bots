import { ChooseTicketAmountPage } from '../pages/choose-ticket-amount/choose-ticket-amount-page'
import { ConfirmPurchasePage } from '../pages/confirm-purchase/confirm-purchase-page'
import { InsufficientFundsPage } from '../pages/insufficient-funds/insufficient-funds-page'
import { PageContent } from '../pages/interfaces'
import { getUserBalance } from '../services/balance.service'
import { getStakeByIdOrThrow } from '../services/stake.service'
import { ActiveFlow, Context, TicketPurchaseStep } from '../types'

export async function enterTicketAmountStep(
	ctx: Context,
	stakeId: string,
): Promise<PageContent> {
	const stake = await getStakeByIdOrThrow(stakeId)

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
	const stake = await getStakeByIdOrThrow(stakeId)
	const userBalance = await getUserBalance()
	const totalCost = ticketAmount * stake.ticketPrice

	if (userBalance < totalCost) {
		return InsufficientFundsPage.render(stake, ticketAmount, userBalance)
	}

	ctx.session = {
		activeFlow: ActiveFlow.TicketPurchase,
		step: TicketPurchaseStep.Confirming,
		ticketAmount,
		stakeId,
	}

	return ConfirmPurchasePage.render(stake, ticketAmount)
}
