export type BuyTicketsFlow =
	| {
			flowType: 'example'
			step: 'step1'
			data: { stakeId: number }
	  }
	| {
			flowType: 'example'
			step: 'step2'
			data: { stakeId: number; ticketCount: number }
	  }

export type SetPausedFlow = {
	flowType: 'setPaused'
	step: 'confirm'
	data: { isPaused: boolean }
}

export type Flow = BuyTicketsFlow | SetPausedFlow | null
