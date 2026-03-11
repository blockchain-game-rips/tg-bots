import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../commands'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'

export class InsufficientFundsPage {
	static render(
		stake: { stakeId: number; ticketPrice: number },
		ticketAmount: number,
		userBalance: number,
	): PageContent {
		const message = this.message(stake, ticketAmount, userBalance)

		return {
			message,
			keyboard: new InlineKeyboard()
				.text(
					'Back',
					buildCommand({
						pageId: pageIds.chooseTicketAmount,
						type: 'open',
						payloads: [stake.stakeId.toString()],
					}),
				)
				.text(
					'Home',
					buildCommand({ pageId: pageIds.home, type: 'open' }),
				),
		}
	}

	private static message(
		stake: { stakeId: number; ticketPrice: number },
		ticketAmount: number,
		userBalance: number,
	) {
		const totalCost = stake.ticketPrice * ticketAmount

		let message = `Stake: ${stake.ticketPrice} ETH\n\nTicket amount: ${ticketAmount}\n\nTotal cost: ${totalCost} ETH`

		message += `\n\n⚠️ Insufficient Balance: ${userBalance} ETH`

		return message
	}
}
