import { InlineKeyboard } from 'grammy'
import { AboutPage, aboutPageInstance } from '../about/about-page'
import { CallbackQueryContext, Page } from '../page'
import { PlayPage, playPageInstance } from '../play/play-page'

export class HomePage extends Page {
	id: string = 'home'
	override hasNavigation = false

	override _keyboard(ctx?: CallbackQueryContext): InlineKeyboard {
		const inlineKeyboard = new InlineKeyboard()
			.text('About', this.aboutPage.id)
			.text('Play Rips', this.playPage.id)

		return inlineKeyboard
	}

	constructor(
		private readonly aboutPage: AboutPage,
		private readonly playPage: PlayPage,
	) {
		super([aboutPage, playPage])
	}

	message(ctx?: CallbackQueryContext): string {
		return 'Here is the home page'
	}
}

export const homePageInstance = new HomePage(
	aboutPageInstance,
	playPageInstance,
)
