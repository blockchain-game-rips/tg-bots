import { User } from '@grammyjs/types'
import { Context as GrammyContext, InlineKeyboard, SessionFlavor } from 'grammy'
import { Flow } from './flows'

export type ActionId<P = void> = string & { readonly __payloadType: P }

export type MessageToEdit = {
	pageContent: PageContent
	messageId: number
}

export type SessionData<F extends Flow = Flow> = {
	telegramId: string
	lastAsk: {
		onSubmit: ActionId<any>
		pageToEdit: MessageToEdit
	} | null
	flow: F
}

export type Context = GrammyContext &
	SessionFlavor<SessionData> & { from: User }

export enum EffectType {
	EDIT,
	ASK,
	SEND_LOADING,
}

export type EffectEdit = { type: EffectType.EDIT; page: PageContent }
export type EffectAsk = {
	type: EffectType.ASK
	prompt: PromptContent
	onSubmit: ActionId<any>
}
export type EffectLoading = {
	type: EffectType.SEND_LOADING
	message: string
	next: () => Promise<Effect>
}

export type Effect = EffectEdit | EffectAsk | EffectLoading

export type PageContent = {
	message: string
	keyboard: InlineKeyboard
}

export type NavIds =
	| { home: ActionId<void>; parent: ActionId<void> }
	| { home: ActionId<void>; parent: ActionId<any>; parentPayload: any }

export type PromptContent = {
	message: string
	placeholder: string
}

export type Chain = {
	namespace: string
	reference: string
}
