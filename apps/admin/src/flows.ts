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

export interface SetPausedFlow {
	flowType: 'setPaused'
	step: 'confirm'
	data: { isPaused: boolean }
}

export interface SetReferrerFrozenFlow {
	flowType: 'setReferrerFrozen'
	step: 'confirm'
	data: { address: string; frozen: boolean }
}

export interface SetDefaultFeeFlow {
	flowType: 'setDefaultFee'
	step: 'confirm'
	data: { bp: number }
}

export interface SetTiersFlow {
	flowType: 'setTiers'
	step: 'confirm'
	data: { tiers: { minVolume: number; feePercent: number }[] }
}

export interface UpdateStakeConfigFlow {
	flowType: 'updateStakeConfig'
	step: 'confirm'
	data: {
		stakeId: number
		ticketCap: number
		feePercent: number
		ticketPrice: number
		durationSeconds: number
		prizeDistribution: {
			prizeCount: number
			minPrize: number
			maxPrize: number
		}[]
	}
}

export type Flow =
	| BuyTicketsFlow
	| SetPausedFlow
	| SetReferrerFrozenFlow
	| SetDefaultFeeFlow
	| SetTiersFlow
	| UpdateStakeConfigFlow
	| null
