import { InlineKeyboard } from 'grammy'
import { FlowBase } from './session/session-utils'

export type ActionId<P = void> = string & { readonly __payloadType: P }

export interface MessageToEdit {
	pageContent: PageContent
	messageId: number
}

export interface SessionData<F extends FlowBase | null> {
	telegramId: string
	lastAsk: {
		onSubmit: ActionId<unknown>
		pageToEdit: MessageToEdit
	} | null
	flow: F
	lastPage: PageContent | null
}

export enum EffectType {
	EDIT,
	ASK,
	SEND_LOADING,
}

export interface EffectEdit {
	type: EffectType.EDIT
	page: PageContent
}

export interface EffectAsk {
	type: EffectType.ASK
	prompt: PromptContent
	onSubmit: ActionId<unknown>
}

export interface EffectLoading {
	type: EffectType.SEND_LOADING
	message: string
	next: () => Promise<Effect>
}

export type Effect = EffectEdit | EffectAsk | EffectLoading

export interface PageContent {
	message: string
	keyboard: InlineKeyboard
}

export type NavIds =
	| { home: ActionId; parent: ActionId }
	| {
			home: ActionId
			parent: ActionId<unknown>
			parentPayload: unknown
	  }

export interface PromptContent {
	message: string
	placeholder: string
}

export interface Chain {
	namespace: string
	reference: string
}
