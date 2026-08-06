import { CurrencyAmountDtoOutput, CurrencyDtoOutput } from '@rips/api-client'
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
				currency: CurrencyDtoOutput
			}
	  }

export interface WithdrawFlow {
	flowType: 'withdraw'
	step: 'withdraw-page'
	data: {
		currencyBalance: CurrencyAmountDtoOutput
		nativeBalance: CurrencyAmountDtoOutput
		amount?: bigint
		recipientAddress?: string
	}
}

export type SwapFlow =
	| {
			flowType: 'swap'
			step: 'src-chosen'
			data: {
				srcCurrencyBalance: CurrencyAmountDtoOutput
				nativeCurrencyBalance: CurrencyAmountDtoOutput
			}
	  }
	| {
			flowType: 'swap'
			step: 'src-dst-chosen'
			data: {
				srcCurrencyBalance: CurrencyAmountDtoOutput
				nativeCurrencyBalance: CurrencyAmountDtoOutput
				dstCurrency: CurrencyDtoOutput
			}
	  }
	| {
			flowType: 'swap'
			step: 'src-dst-amount-chosen'
			data: {
				srcCurrencyBalance: CurrencyAmountDtoOutput
				nativeCurrencyBalance: CurrencyAmountDtoOutput
				dstCurrency: CurrencyDtoOutput
				amountIn: bigint
			}
	  }

export type Flow = EnterFlow | WithdrawFlow | SwapFlow | null

export const { toFlow, toStep, toHold, toReset } = createFlowTransitions<Flow>()
