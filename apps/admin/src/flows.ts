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

export type SetReferrerFrozenFlow = {
	flowType: 'setReferrerFrozen'
	step: 'confirm'
	data: { address: string; frozen: boolean }
}

export type Flow = BuyTicketsFlow | SetPausedFlow | SetReferrerFrozenFlow | null
