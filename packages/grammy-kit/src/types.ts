import { FormattedString } from '@grammyjs/parse-mode'
import { InlineKeyboard, InputFile } from 'grammy'
import { FlowBase, FlowTransition } from './session/session-utils'

export type ActionId<P = void> = string & { readonly __payloadType: P }

export interface MessageToEdit {
	pageContent: PageContent
	messageId: number
	hasPhoto: boolean
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

export interface EffectLoading<F extends FlowBase | null = FlowBase | null> {
	type: EffectType.SEND_LOADING
	message: FormattedString
	next: () => Promise<HandlerResult<F>>
}

export type Effect = EffectEdit | EffectAsk | EffectLoading

export interface HandlerResult<F extends FlowBase | null> {
	flow: FlowTransition<F>
	effect: Effect
}

export type Line = string | FormattedString

export interface PageContent {
	message: FormattedString
	keyboard: InlineKeyboard
	photo?: InputFile
}

export type NavIds =
	| { home: ActionId; parent: ActionId }
	| {
			home: ActionId
			parent: ActionId<unknown>
			parentPayload: unknown
	  }

export interface PromptContent {
	message: FormattedString
	placeholder: string
}

//TODO: move from this package, it shouldn't be here
export interface Chain {
	namespace: string
	reference: string
}
