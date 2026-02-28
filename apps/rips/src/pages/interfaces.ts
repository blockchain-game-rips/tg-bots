import { Context, Filter, InlineKeyboard } from 'grammy'

export type CallbackQueryContext = Filter<Context, 'callback_query:data'>

export type Page = {
	message: string
	keyboard: InlineKeyboard
}

export interface Renderable {
	render(ctx: Context): Page
}

export type NavIds = {
	home: string
	parent: string
}

export interface WithNav {
	navIds: NavIds
}

export type KeyboardLayout = {
	label: string
	pageId: string
}[]

export interface WithKeyboard {
	keyboardLayout: KeyboardLayout
}
