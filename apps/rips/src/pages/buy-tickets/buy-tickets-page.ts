import { InlineKeyboard } from 'grammy'
import { CallbackQueryContext, Page } from '../page'

export class BuyTicketsPage extends Page {
	override _keyboard(ctx?: CallbackQueryContext): InlineKeyboard {
		return new InlineKeyboard()
	}

	hasNavigation = true
	id = 'buyTickets'

	constructor() {
		super([])
	}

	message(): string {
		return 'buy tickets page'
	}
}
export const buyTicketsPageInstance = new BuyTicketsPage()
