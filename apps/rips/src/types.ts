import { User } from '@grammyjs/types'
import { Context as GrammyContext, InlineKeyboard, SessionFlavor } from 'grammy'

export enum ActiveFlow {
	TicketPurchase,
	Withdraw,
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

export enum WithdrawStep {
	OnWithdrawPage,
	WaitingForRecipient,
	WaitingForCustomAmount,
}

export type MessageToEdit = { pageContent: PageContent; messageId: number }

export type WithdrawSession = {
	activeFlow: ActiveFlow.Withdraw
} & (
	| {
			step: WithdrawStep.OnWithdrawPage
			messageToEdit: MessageToEdit
			amount?: string
			recipientAddress?: string
	  }
	| {
			step: WithdrawStep.WaitingForRecipient
			messageToEdit: MessageToEdit
			amount?: string
	  }
	| {
			step: WithdrawStep.WaitingForCustomAmount
			messageToEdit: MessageToEdit
			recipientAddress?: string
	  }
)

export type SessionData = EmptySession | TicketPurshaseSession | WithdrawSession

export type Context = GrammyContext &
	SessionFlavor<SessionData> & { from: User }

export type PageContent = {
	message: string
	keyboard: InlineKeyboard
}

export type NavIds = {
	home: string
	parent: string
}

export type Row = 'row'
export type StaticLayout = {
	label: string
	pageId: string
}

export type KeyboardLayout = (StaticLayout | Row)[]

export type PromptContent = {
	message: string
	placeholder: string
}
