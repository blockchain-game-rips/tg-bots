import { CurrencyAmountDto, CurrencyDto } from '@rips/api-client'
import { createFlowTransitions } from '@rips/grammy-kit'

export type EnterFlow =
	| {
			flowType: 'enter'
			step: 'preset-chosen'
			data: { presetId: number }
	  }
	| {
			flowType: 'enter'
			step: 'entry-count-chosen'
			data: { presetId: number; entryCount: number }
	  }
	| {
			flowType: 'enter'
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

export type SwapFlow =
	| {
			flowType: 'swap'
			step: 'src-chosen'
			data: {
				srcCurrencyBalance: CurrencyAmountDto
				nativeCurrencyBalance: CurrencyAmountDto
			}
	  }
	| {
			flowType: 'swap'
			step: 'src-dst-chosen'
			data: {
				srcCurrencyBalance: CurrencyAmountDto
				nativeCurrencyBalance: CurrencyAmountDto
				dstCurrency: CurrencyDto
			}
	  }
	| {
			flowType: 'swap'
			step: 'src-dst-amount-chosen'
			data: {
				srcCurrencyBalance: CurrencyAmountDto
				nativeCurrencyBalance: CurrencyAmountDto
				dstCurrency: CurrencyDto
				amountIn: bigint
			}
	  }

export type Flow = EnterFlow | WithdrawFlow | SwapFlow | null

export const { toFlow, toStep, toHold, toReset } = createFlowTransitions<Flow>()
