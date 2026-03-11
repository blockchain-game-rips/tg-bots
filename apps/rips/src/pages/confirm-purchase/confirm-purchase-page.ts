import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../commands'
import { PageContent } from '../interfaces'
import { pageIds } from '../page-ids'

type Stake = { stakeId: number; ticketPrice: number }

export class ConfirmPurchasePage {
	static render(stake: Stake, ticketAmount: number): PageContent {
		const totalCost = stake.ticketPrice * ticketAmount

		return {
			message: `Stake: ${stake.ticketPrice} ETH\n\nTicket amount: ${ticketAmount}\n\nTotal cost: ${totalCost} ETH`,
			keyboard: new InlineKeyboard()
				.text('Confirm')
				.row()
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
}
