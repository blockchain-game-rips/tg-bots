import { CurrencyDto } from '@rips/api-client'

export type BuyEntriesFlow =
	| {
			flowType: 'buyEntries'
			step: 'preset-chosen'
			data: { presetId: number }
	  }
	| {
			flowType: 'buyEntries'
			step: 'entry-count-chosen'
			data: { presetId: number; entryCount: number }
	  }
	| {
			flowType: 'buyEntries'
			step: 'zap-currency-chosen'
			data: {
				presetId: number
				entryCount: number
				currency: CurrencyDto
			}
	  }

export interface WithdrawFlow {
	flowType: 'withdraw'
	step: 'currency-chosen'
	data: {
		amount?: bigint
		recipientAddress?: string
		currency: CurrencyDto
	}
}

export type Flow = BuyEntriesFlow | WithdrawFlow | null
