import { Menu } from '@grammyjs/menu'
import { Page } from '../page'

export class AboutPage extends Page {
	id: string = 'about'
	menu: Menu
	private homePage?: Page

	constructor() {
		super()
		this.menu = new Menu(this.id).text('Back', (ctx) =>
			this.homePage!.navigate(ctx),
		)
	}

	setBackPage(page: Page) {
		this.homePage = page
	}

	message(): string {
		return 'description of game'
	}
}

export const aboutPageInstance = new AboutPage()
