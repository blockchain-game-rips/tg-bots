import { InlineKeyboard } from 'grammy'
import {
	BuyTicketsPage,
	buyTicketsPageInstance,
} from '../buy-tickets/buy-tickets-page'
import { Page } from '../page'

export class PlayPage extends Page {
	id: string = 'play'
	hasNavigation = true

	_keyboard(): InlineKeyboard {
		return new InlineKeyboard().text('Buy tickets', this.buyTicketsPage.id)
	}

	constructor(private readonly buyTicketsPage: BuyTicketsPage) {
		super([buyTicketsPage])
	}

	message(): string {
		return 'Play menu'
	}
}

export const playPageInstance = new PlayPage(buyTicketsPageInstance)
