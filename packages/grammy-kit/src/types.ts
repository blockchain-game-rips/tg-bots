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
		message: Message | null
		promptMessageId: number
	} | null
	flow: F
	lastNavigatedPage: PageContent | null
	history: HistoryEntry[]
}

export enum EffectType {
	NAVIGATE,
	ASK,
	LOADING,
}

export interface EffectNavigate {
	type: EffectType.NAVIGATE
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
	type: EffectType.LOADING
	message: FormattedString
	next: () => Promise<HandlerResult<F>>
}

export type Effect = EffectNavigate | EffectAsk | EffectLoading

export type HandlerResult<F extends FlowBase | null> =
	| { flow: FlowTransition<F>; effect: EffectNavigate | EffectAsk }
	| { flow?: never; effect: EffectLoading<F> }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyHandlerResult = HandlerResult<any>

export type LastAsk = NonNullable<SessionData['lastAsk']>

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

export type Message = {
	messageId: number
	hasPhoto: boolean
}
