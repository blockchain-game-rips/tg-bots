import { Menu, type MenuFlavor } from '@grammyjs/menu'
import type { Context, Filter } from 'grammy'

type MenuContext = Filter<Context, 'callback_query:data'> & MenuFlavor

export abstract class Page {
	abstract id: string
	abstract menu: Menu

	async navigate(ctx: MenuContext) {
		ctx.menu.nav(this.id)

		await ctx.editMessageText(this.message())
	}

	abstract message(): string
}
