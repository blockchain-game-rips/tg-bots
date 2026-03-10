import { InlineKeyboard } from 'grammy'
import { Context } from '../types'

export type PageContent = {
	message: string
	keyboard: InlineKeyboard
}

export interface Page {
	render(args: { ctx?: Context; params?: string[] }): PageContent | Promise<PageContent>
}

export type NavIds = {
	home: string
	parent: string
}

export type StaticLayout = {
	label: string
	pageId: string
}

export type KeyboardLayout = StaticLayout[]

export type PromptContent = {
	message: string
	placeholder: string
}

export interface Prompt {
	render(args: { ctx?: Context; params?: string[] }): PromptContent | Promise<PromptContent>
}
