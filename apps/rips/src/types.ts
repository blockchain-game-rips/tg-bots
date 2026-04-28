import { User } from '@grammyjs/types'
import { Context as GrammyContext, InlineKeyboard, SessionFlavor } from 'grammy'
import { ActionId } from './actions'

export type BuyTicketsFlow =
	| {
			flowType: 'buyTickets'
			step: 'stake-chosen'
			data: { stakeId: number }
	  }
	| {
			flowType: 'buyTickets'
			step: 'ticket-count-chosen'
			data: { stakeId: number; ticketCount: number }
	  }

export type WithdrawFlow = {
	flowType: 'withdraw'
	step: 'on-withdraw-page'
	data: { amount?: string; recipientAddress?: string }
}

export type FlowData = BuyTicketsFlow | WithdrawFlow | null

export type MessageToEdit = {
	pageContent: PageContent
	messageId: number
}

export type SessionData = {
	telegramId: string
	lastAsk: {
		onSubmit: ActionId
		pageToEdit: MessageToEdit
	} | null
	flow: FlowData
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

export type StaticLayout = {
	label: string
	actionId: ActionId
	payload?: string
}

export type KeyboardLayout = (StaticLayout | Row)[]

export type PromptContent = {
	message: string
	placeholder: string
}

export type Chain = {
	namespace: string
	reference: string
	name: string
}
