import { Context as GrammyContext, SessionFlavor } from 'grammy'

export type EmptySession = {
	activeFlow: null
}

export type TicketPurshaseSession = {
	activeFlow: 'ticket-purchase'
} & (
	| {
			stakeId: string
			step: 'choose-ticket-amount'
	  }
	| {
			stakeId: string
			step: 'waiting-for-input'
			messageIdToEdit: number
	  }
	| { stakeId: string; ticketAmount: number; step: 'confirming' }
)

export type SessionData = EmptySession | TicketPurshaseSession

export type Context = GrammyContext & SessionFlavor<SessionData>
