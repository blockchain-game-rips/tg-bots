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

export type SetDefaultFeeFlow = {
	flowType: 'setDefaultFee'
	step: 'confirm'
	data: { bp: number }
}

export type SetTiersFlow = {
	flowType: 'setTiers'
	step: 'confirm'
	data: { tiers: Array<{ minVolume: number; feePercent: number }> }
}

export type Flow =
	| BuyTicketsFlow
	| SetPausedFlow
	| SetReferrerFrozenFlow
	| SetDefaultFeeFlow
	| SetTiersFlow
	| null
