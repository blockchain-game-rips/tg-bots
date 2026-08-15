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

export interface Workspace<F extends FlowBase | null = any> {
	/** the bot message this workspace lives behind */
	messageId: number
	lastInteraction: number
	lastAsk: {
		onSubmit: ActionId<unknown>
		message: Message | null
		promptMessageId: number
	} | null
	flow: F
	lastNavigatedPage: PageContent | null
	history: HistoryEntry[]
}

export interface SessionData<F extends FlowBase | null = FlowBase | null> {
	workspaces: Workspace<F>[]
}

export enum EffectType {
	NAVIGATE,
	ASK,
	LOADING,
}

/**
 * How a navigation is written to the back trail. A page entry stores the
 * rendered page, so `replayWith` is meaningless there and the union forbids it.
 */
export type HistoryOptions =
	| { kind: 'page'; clears?: boolean }
	| {
			kind?: 'action'
			clears?: boolean

			/**
			 * Callback data recorded instead of the action that ran, so back
			 * re-renders the page without repeating a mutation or replaying a
			 * secret payload. Build it with `buildActionData` when the recorded
			 * action needs a payload; pass the bare action id when it does not,
			 * since dropping the payload is what keeps secrets out of the trail.
			 */
			replayWith?: string
	  }

export interface EffectNavigate {
	type: EffectType.NAVIGATE
	page: PageContent
	history?: HistoryOptions
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

export type LastAsk = NonNullable<Workspace['lastAsk']>

export type Line = string | FormattedString

interface PageContentBase {
	message: FormattedString
	keyboard: InlineKeyboard

	/** Holds a secret, so it is never kept in the session. */
	sensitive?: boolean

	/** Supersedes the entry on screen when it holds the same slot. */
	trailSlot?: string
}

export interface PhotoPage extends PageContentBase {
	photo: InputFile
}

export interface TextPage extends PageContentBase {
	photo?: never
}

export type PageContent = PhotoPage | TextPage

export interface PromptContent {
	message: FormattedString
	placeholder: string
}

export interface Message {
	messageId: number
	hasPhoto: boolean
}
