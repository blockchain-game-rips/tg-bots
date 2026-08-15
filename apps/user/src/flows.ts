import { ChainAddressDtoOutput, CurrencyDtoOutput } from '@rips/api-client'
import { createFlowTransitions } from '@rips/grammy-kit'

/** A referrer is recorded once, when the account is created, so the address
 * from a referral link only has to survive until then. */
export interface OnboardingFlow {
	flowType: 'onboarding'
	step: 'choosing-account-type'
	data: { referrerAddress?: string }
}

export type EnterFlow =
	| {
			flowType: 'enter'
			step: 'choosing-entry-count'
			data: { presetId: number }
	  }
	| {
			flowType: 'enter'
			step: 'choosing-payment-token'
			data: {
				presetId: number
				entryCount: number
			}
	  }
	| {
			flowType: 'enter'
			step: 'at-checkout'
			data: {
				presetId: number
				entryCount: number
				payChainAddress: ChainAddressDtoOutput
			}
	  }

export interface WithdrawFlow {
	flowType: 'withdraw'
	step: 'withdraw-page'
	data: {
		chainAddress: ChainAddressDtoOutput
		amount?: bigint
		recipientAddress?: string
	}
}

export type SwapFlow =
	| {
			flowType: 'swap'
			step: 'src-chosen'
			data: {
				srcChainAddress: ChainAddressDtoOutput
			}
	  }
	| {
			flowType: 'swap'
			step: 'src-dst-chosen'
			data: {
				srcChainAddress: ChainAddressDtoOutput
				dstCurrency: CurrencyDtoOutput
			}
	  }
	| {
			flowType: 'swap'
			step: 'src-dst-amount-chosen'
			data: {
				srcChainAddress: ChainAddressDtoOutput
				dstCurrency: CurrencyDtoOutput
				amountIn: bigint
			}
	  }

export type Flow = OnboardingFlow | EnterFlow | WithdrawFlow | SwapFlow | null

export const { toFlow, toStep, toHold, toReset } = createFlowTransitions<Flow>()
