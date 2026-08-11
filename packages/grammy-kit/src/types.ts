import { FormattedString } from '@grammyjs/parse-mode'
import { InlineKeyboard, InputFile } from 'grammy'
import { FlowBase, FlowTransition } from './session/session-utils'

export type ActionId<P = void> = string & { readonly __payloadType: P }

export interface ActionData {
	actionId: string
	payload: string | undefined
}

export type HistoryEntry =
	| { kind: 'action'; action: ActionData }
	| { kind: 'page'; page: PageContent }

export interface SessionData<F extends FlowBase | null = any> {
	telegramId: string
	lastAsk: {
		onSubmit: ActionId<unknown>
		messageToEdit: Message
		promptMessageId: number
	} | null
	flow: F
	lastPage: PageContent | null
	history: HistoryEntry[]
}

export enum EffectType {
	EDIT,
	ASK,
	SEND_LOADING,
}

export interface EffectEdit {
	type: EffectType.EDIT
	page: PageContent
	history?: {
		kind?: 'action' | 'page'
		clears?: boolean
	}
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

interface PageContentBase {
	message: FormattedString
	keyboard: InlineKeyboard
}

export interface PhotoPage extends PageContentBase {
	photo: InputFile
}

export interface TextPage extends PageContentBase {
	photo?: never
}

export type PageContent = PhotoPage | TextPage

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

export interface MessageRef {
	chatId: number
	messageId: number
}

export type Message = MessageRef & {
	hasPhoto: boolean
}
