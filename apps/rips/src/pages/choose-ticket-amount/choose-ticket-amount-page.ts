import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../commands'
import { getStakesMock } from '../../services/stake.service'
import { Context } from '../../types'
import { NavIds, Page, Renderable, WithNav } from '../interfaces'
import { addNav } from '../utils.ts/utils'

export const chooseTicketAmountPageId = 'choose-t-a'

export class ChooseTicketAmountPage implements Renderable, WithNav {
	constructor(readonly navIds: NavIds) {}

	async render(args: { ctx: Context; params: string[] }): Promise<Page> {
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
				buildCommand({ pageId: 'custom', type: 'reply' }),
			)

		return {
			message: `Choose tickets amount for stake ${stake.ticketPrice} ETH`,
			keyboard: addNav(keyboard, this.navIds),
		}
	}
}
