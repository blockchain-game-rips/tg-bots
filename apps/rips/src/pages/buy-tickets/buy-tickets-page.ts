import { InlineKeyboard } from 'grammy'
import { NavIds, Page, Renderable, WithNav } from '../interfaces'
import { addNav } from '../utils.ts/utils'

export class BuyTicketsPage implements Renderable, WithNav {
	constructor(readonly navIds: NavIds) {}

	render(): Page {
		return {
			message: 'buy tickets page',
			keyboard: addNav(new InlineKeyboard(), this.navIds),
		}
	}
}
