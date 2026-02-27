import type { Context, Filter, InlineKeyboard } from 'grammy'

export type CallbackQueryContext = Filter<Context, 'callback_query:data'>

export abstract class Page {
	abstract id: string
	abstract hasNavigation: boolean

	constructor(childPages: Page[]) {
		for (const childPage of childPages) {
			if (childPage.hasNavigation) {
				childPage.setParentPage(this)
			}
		}
	}

	private parentPage: Page | undefined
	private homePage: Page | undefined

	setHomePage(homePage: Page) {
		if (this.homePage !== undefined) {
			throw new Error(
				`Page ${this.id} already has home page ${this.homePage.id}`,
			)
		}

		this.homePage = homePage
	}

	setParentPage(parentPage: Page) {
		if (this.parentPage !== undefined) {
			throw new Error(
				`Page ${this.id} already has parent page ${this.parentPage.id}`,
			)
		}

		this.parentPage = parentPage
	}

	async navigate(ctx: Filter<Context, 'callback_query:data'>) {
		await ctx.editMessageText(this.message(ctx), {
			reply_markup: this.keyboard(ctx),
		})
	}

	keyboard(ctx?: CallbackQueryContext) {
		const keyboard = this._keyboard(ctx)

		if (this.hasNavigation) {
			if (this.parentPage === undefined)
				throw new Error(
					'hasNavigation is true, but no parent page is set',
				)

			if (this.homePage === undefined)
				throw new Error(
					'hasNavigation is true, but no home page is set',
				)

			keyboard.row().text('Back', this.parentPage.id)

			if (this.homePage.id !== this.parentPage.id) {
				keyboard.text('Home', this.homePage.id)
			}
		}

		return keyboard
	}

	abstract message(ctx?: CallbackQueryContext): string
	abstract _keyboard(ctx?: CallbackQueryContext): InlineKeyboard
}
