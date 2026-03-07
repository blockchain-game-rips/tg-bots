import { Context, InlineKeyboard } from 'grammy'
import { NavIds, Page, Renderable, WithNav } from '../interfaces'
import { addNav } from '../utils.ts/utils'

export const chooseTicketAmountPageId = 'choose-t-a'

export class ChooseTicketAmountPage implements Renderable, WithNav {
	constructor(readonly navIds: NavIds) {}

	render(args: { ctx: Context; params: string[] }): Page {
		const { params } = args

		const keyboard = new InlineKeyboard()
			.text('1 Ticket')
			.text('3 Tickets')
			.text('Custom amount')

		return {
			message: `Choose tickets amount for stakeId ${params[0]}`,
			keyboard: addNav(keyboard, this.navIds),
		}
	}
}
