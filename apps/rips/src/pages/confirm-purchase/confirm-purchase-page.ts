import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../commands'
import { getStakesMock } from '../../services/stake.service'
import { Context } from '../../types'
import { Page, PageContent } from '../interfaces'
import { pageIds } from '../page-ids'

export class ConfirmPurchasePage implements Page {
	constructor() {}

	async render(args: { ctx: Context; params: string[] }): Promise<PageContent> {
		const session = args.ctx.session

		if (session.activeFlow !== 'ticket-purchase')
			throw new Error('wrong session')

		if (session.step !== 'confirming') throw new Error('wrong step')

		const stakes = await getStakesMock()

		const stake = stakes.find(
			(stake) => stake.stakeId.toString() === session.stakeId,
		)

		if (stake === undefined) {
			throw new Error(`stakeId ${session.stakeId} is invalid`)
		}

		return {
			message: `Stake: ${stake.ticketPrice} ETH\n\nTicket amount: ${session.ticketAmount}`,
			keyboard: new InlineKeyboard()
				.text(
					'Back',
					buildCommand({
						pageId: pageIds.chooseTicketAmount,
						type: 'open',
						payloads: [session.stakeId],
					}),
				)
				.text('Home', buildCommand({ pageId: pageIds.home, type: 'open' })),
		}
	}
}
