import { Context as GrammyContext, SessionFlavor } from 'grammy'
import { PageContent } from './pages/interfaces'

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
