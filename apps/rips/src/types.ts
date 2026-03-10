import { Context as GrammyContext, SessionFlavor } from 'grammy'

export type EmptySession = {
	activeFlow: null
}

export type TicketPurshaseSession = {
	activeFlow: 'ticket-purchase'
} & (
	| {
			stakeId: string
	  }
	| { stakeId: string; ticketAmount: number }
)

export type SessionData = EmptySession | TicketPurshaseSession

export type Context = GrammyContext & SessionFlavor<SessionData>
