import { CurrencyAmountDto, CurrencyDto } from '../generated/api-client'

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
	| {
			flowType: 'buyTickets'
			step: 'zap-currency-chosen'
			data: {
				stakeId: number
				ticketCount: number
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

export type SwapSelecting = 'in' | 'out'

export interface SwapFlow {
	flowType: 'swap'
	step: 'idle'
	data: {
		currencyIn?: CurrencyDto
		currencyOut?: CurrencyDto
		amountIn?: bigint
		quotedAmountOut?: CurrencyAmountDto
	}
}

export type Flow = BuyTicketsFlow | WithdrawFlow | SwapFlow | null
