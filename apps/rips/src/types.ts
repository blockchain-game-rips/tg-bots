import { Context as GrammyContext, InlineKeyboard, SessionFlavor } from 'grammy'

export enum ActiveFlow {
	TicketPurchase,
}

export enum TicketPurchaseStep {
	ChoosingTicketAmount,
	WaitingForInput,
	Confirming,
}

export type EmptySession = {
	activeFlow: null
}

export type TicketPurshaseSession = {
	activeFlow: ActiveFlow.TicketPurchase
} & (
	| {
			stakeId: string
			step: TicketPurchaseStep.ChoosingTicketAmount
	  }
	| {
			stakeId: string
			step: TicketPurchaseStep.WaitingForInput
			messageToEdit: {
				pageContent: PageContent
				messageId: number
			}
	  }
	| {
			stakeId: string
			ticketAmount: number
			step: TicketPurchaseStep.Confirming
	  }
)

export type SessionData = EmptySession | TicketPurshaseSession

export type Context = GrammyContext & SessionFlavor<SessionData>

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
