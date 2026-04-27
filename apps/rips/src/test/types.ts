import { User } from '@grammyjs/types'
import { Context as GrammyContext, SessionFlavor } from 'grammy'
import { PageContent, PromptContent } from '../types'

import { ActionId } from './action-ids'

export type SessionData = {
	lastAsk: {
		onSubmit: ActionId
		pageToEdit: MessageToEdit
	} | null
	flow: FlowData
}

export type ChooseTicketFlow =
	| {
			flowType: 'buyTickets'
			step: 'stake-chosen'
			data: { stakeId: number }
	  }
	| {
			flowType: 'buyTickets'
			step: 'stake-ticket-count-chosen'
			data: { stakeId: number; ticketCount: number }
	  }

export type FlowData = ChooseTicketFlow | null

export type MessageToEdit = {
	pageContent: PageContent
	messageId: number
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
