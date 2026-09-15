export type EnterFlow =
	| {
			flowType: 'example'
			step: 'step1'
			data: { presetId: number }
	  }
	| {
			flowType: 'example'
			step: 'step2'
			data: { presetId: number; entryCount: number }
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

export type SetReferrerCustomFeeFlow =
	| {
			flowType: 'setReferrerCustomFee'
			step: 'fee'
			data: { address: string }
	  }
	| {
			flowType: 'setReferrerCustomFee'
			step: 'confirm'
			data: { address: string; feeBps: number }
	  }

export interface SetDefaultFeeFlow {
	flowType: 'setDefaultFee'
	step: 'confirm'
	data: { feeBps: number }
}

export interface SetTiersFlow {
	flowType: 'setTiers'
	step: 'confirm'
	data: { tiers: { minVolume: number; feePercent: number }[] }
}

export interface UpdatePresetConfigFlow {
	flowType: 'updatePresetConfig'
	step: 'confirm'
	data: {
		presetId: number
		entryCap: number
		feePercent: number
		entryPrice: number
		durationSeconds: number
		payoutDistribution: {
			payoutCount: number
			minPayout: number
			maxPayout: number
		}[]
	}
}

export interface SetBlockedCountriesFlow {
	flowType: 'setBlockedCountries'
	step: 'confirm'
	data: { countries: string[] }
}

export interface UploadTermsFlow {
	flowType: 'uploadTerms'
	step: 'confirm'
	data: { fileId: string; fileName: string | null }
}

export type Flow =
	| EnterFlow
	| SetPausedFlow
	| SetReferrerFrozenFlow
	| SetReferrerCustomFeeFlow
	| SetDefaultFeeFlow
	| SetTiersFlow
	| UpdatePresetConfigFlow
	| SetBlockedCountriesFlow
	| UploadTermsFlow
	| null
