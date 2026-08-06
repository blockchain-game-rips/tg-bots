import { PayoutDtoOutput } from '@rips/api-client'
import { tierByIndex } from './tiers'

export function bestPull(
	payouts: PayoutDtoOutput[],
): PayoutDtoOutput | undefined {
	return payouts.reduce<PayoutDtoOutput | undefined>((best, payout) => {
		if (best === undefined) return payout

		return BigInt(payout.payoutAmount) > BigInt(best.payoutAmount)
			? payout
			: best
	}, undefined)
}

export function bestPullLabel(payout: PayoutDtoOutput): string {
	const emoji = tierByIndex(payout.card.tier)?.emoji ?? ''

	return `${emoji} ${payout.card.name}`
}
