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

export type Flow = BuyTicketsFlow | WithdrawFlow | null
