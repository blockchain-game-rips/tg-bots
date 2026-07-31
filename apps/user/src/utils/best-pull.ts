import { PayoutDto } from '@rips/api-client'
import { tierByIndex } from './tiers'

export function bestPull(payouts: PayoutDto[]): PayoutDto | undefined {
	return payouts.reduce<PayoutDto | undefined>((best, payout) => {
		if (best === undefined) return payout

		return BigInt(payout.payoutAmount) > BigInt(best.payoutAmount)
			? payout
			: best
	}, undefined)
}

export function bestPullLabel(payout: PayoutDto): string {
	const emoji = tierByIndex(payout.card.tier)?.emoji ?? ''

	return `${emoji} ${payout.card.name}`
}
