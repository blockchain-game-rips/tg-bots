import { Menu } from '@grammyjs/menu'
import { AboutPage, aboutPageInstance } from '../about/about-page'
import { Page } from '../page'

export class HomePage extends Page {
	menu: Menu

	constructor(private readonly aboutPage: AboutPage) {
		super()

		this.menu = new Menu(this.id).text('About', (ctx) =>
			this.aboutPage.navigate(ctx),
		)
		this.menu.register(this.aboutPage.menu)
		this.aboutPage.setBackPage(this)
	}

	id: string = 'home'

	message(): string {
		return 'Here is the home page'
	}
}

export const homePageInstance = new HomePage(aboutPageInstance)
