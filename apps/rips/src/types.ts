import { User } from '@grammyjs/types'
import { Context as GrammyContext, InlineKeyboard, SessionFlavor } from 'grammy'
import { ActionId } from './actions'
import { Flow } from './flows'

export type MessageToEdit = {
	pageContent: PageContent
	messageId: number
}

export type SessionData<F extends Flow = Flow> = {
	telegramId: string
	lastAsk: {
		onSubmit: ActionId
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

export type Effect =
	| { type: EffectType.EDIT; page: PageContent }
	| { type: EffectType.ASK; prompt: PromptContent; onSubmit: ActionId }
	| {
			type: EffectType.SEND_LOADING
			message: string
			next: () => Promise<Effect>
	  }

export type ActionHandler = (
	session: SessionData,
	payload: string | undefined,
) => Promise<Effect> | Effect

export type PageContent = {
	message: string
	keyboard: InlineKeyboard
}

export type NavIds = {
	home: ActionId
	parent: ActionId
}

export type Row = 'row'

export type StaticButton = {
	label: string
	actionId: ActionId
	payload?: string
}

export type KeyboardLayout = StaticButton[][]

export type PromptContent = {
	message: string
	placeholder: string
}

export type Chain = {
	namespace: string
	reference: string
	name: string
}
