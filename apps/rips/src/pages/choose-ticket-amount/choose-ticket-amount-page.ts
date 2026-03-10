import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../commands'
import { getStakesMock } from '../../services/stake.service'
import { Context } from '../../types'
import { NavIds, Page, PageContent, WithNav } from '../interfaces'
import { promptIds } from '../prompt-ids'
import { addNav } from '../utils.ts/utils'

export class ChooseTicketAmountPage implements Page, WithNav {
	constructor(readonly navIds: NavIds) {}

	async render(args: { ctx: Context; params: string[] }): Promise<PageContent> {
		const stakeId = args.params[0]

		if (stakeId === undefined) {
			throw new Error(
				'stakeId is undefiend, ChooseTicketAmountPage can not be rendered',
			)
		}

		const stakes = await getStakesMock()

		const stake = stakes.find(
			(stake) => stake.stakeId.toString() === stakeId,
		)

		if (stake === undefined) {
			throw new Error(`stakeId ${stakeId} is invalid`)
		}

		args.ctx.session = {
			activeFlow: 'ticket-purchase',
			stakeId: stakeId,
			step: 'choose-ticket-amount',
		}

		const keyboard = new InlineKeyboard()
			.text('1 Ticket')
			.text('3 Tickets')
			.text(
				'Custom amount',
				buildCommand({ pageId: promptIds.customTicketAmount, type: 'reply' }),
			)

		return {
			message: `Choose tickets amount for stake ${stake.ticketPrice} ETH`,
			keyboard: addNav(keyboard, this.navIds),
		}
	}
}
