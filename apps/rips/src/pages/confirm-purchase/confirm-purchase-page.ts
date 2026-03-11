import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../commands'
import { getStakesMock } from '../../services/stake.service'
import { PageContent } from '../interfaces'
import { pageIds } from '../page-ids'

export class ConfirmPurchasePage {
	async render(stakeId: string, ticketAmount: number): Promise<PageContent> {
		const stakes = await getStakesMock()

		const stake = stakes.find(
			(stake) => stake.stakeId.toString() === stakeId,
		)

		if (stake === undefined) {
			throw new Error(`stakeId ${stakeId} is invalid`)
		}

		return {
			message: `Stake: ${stake.ticketPrice} ETH\n\nTicket amount: ${ticketAmount}`,
			keyboard: new InlineKeyboard()
				.text(
					'Back',
					buildCommand({
						pageId: pageIds.chooseTicketAmount,
						type: 'open',
						payloads: [stakeId],
					}),
				)
				.text('Home', buildCommand({ pageId: pageIds.home, type: 'open' })),
		}
	}
}
