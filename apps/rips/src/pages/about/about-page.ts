import { InlineKeyboard } from 'grammy'
import { CallbackQueryContext, Page } from '../page'

export class AboutPage extends Page {
	override _keyboard(ctx?: CallbackQueryContext): InlineKeyboard {
		return new InlineKeyboard()
	}

	hasNavigation = true
	id = 'about'

	constructor() {
		super([])
	}

	message(): string {
		return 'description of game'
	}
}
export const aboutPageInstance = new AboutPage()
