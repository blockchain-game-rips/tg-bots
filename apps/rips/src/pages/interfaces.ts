import { InlineKeyboard } from 'grammy'
import { Context } from '../types'

export type Page = {
	message: string
	keyboard: InlineKeyboard
}

export interface Renderable {
	render(args: { ctx?: Context; params?: string[] }): Page | Promise<Page>
}

export type NavIds = {
	home: string
	parent: string
}

export interface WithNav {
	navIds: NavIds
}

export type StaticLayout = {
	label: string
	pageId: string
}

export type KeyboardLayout = StaticLayout[]

export interface WithKeyboard {
	keyboardLayout: KeyboardLayout
}
