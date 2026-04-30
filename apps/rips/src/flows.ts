import { CurrencyDto } from '../generated/api-client'
import { Chain } from './types'

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

export type WithdrawFlow =
	| {
			flowType: 'withdraw'
			step: 'chain-chosen'
			data: {
				chain: Chain
			}
	  }
	| {
			flowType: 'withdraw'
			step: 'currency-chosen'
			data: {
				amount?: bigint
				recipientAddress?: string

				chain: Chain
				currency: CurrencyDto
			}
	  }

export type Flow = BuyTicketsFlow | WithdrawFlow | null
