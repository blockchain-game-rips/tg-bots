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
	| {
			flowType: 'buyTickets'
			step: 'zap-chain-chosen'
			data: { stakeId: number; ticketCount: number; chain: Chain }
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
