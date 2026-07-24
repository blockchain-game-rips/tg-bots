import { PayloadCodec } from '@rips/grammy-kit'

export interface Tier {
	index: number
	name: string
	emoji: string
}

// Display order: best tier first. Backend identifies a tier by index (0 = worst).
export const TIERS: Tier[] = [
	{ index: 6, name: 'Mythic', emoji: '👑' },
	{ index: 5, name: 'Legendary', emoji: '🟡' },
	{ index: 4, name: 'Epic', emoji: '🟣' },
	{ index: 3, name: 'Rare', emoji: '🔵' },
	{ index: 2, name: 'Spark', emoji: '✨' },
	{ index: 1, name: 'Common', emoji: '⚪' },
	{ index: 0, name: 'Dust', emoji: '🌫' },
]

const TIER_BY_INDEX = new Map<number, Tier>(
	TIERS.map((tier) => [tier.index, tier]),
)

export function tierByIndex(index: number): Tier | undefined {
	return TIER_BY_INDEX.get(index)
}

export function tierName(index: number): string {
	return tierByIndex(index)?.name ?? `Tier ${index.toString()}`
}

export const tierIndexCodec: PayloadCodec<number> = {
	encode: (index) => index.toString(),
	decode: (raw) => {
		const index = Number.parseInt(raw, 10)

		if (Number.isNaN(index)) throw new Error(`Invalid tier index: ${raw}`)

		return index
	},
}
