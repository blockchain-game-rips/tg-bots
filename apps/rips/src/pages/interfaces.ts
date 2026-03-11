import { InlineKeyboard } from 'grammy'

export type PageContent = {
	message: string
	keyboard: InlineKeyboard
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
