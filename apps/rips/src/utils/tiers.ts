export const TIER_NAMES: Record<number, string> = {
	0: 'Common',
	1: 'Rare',
	2: 'Epic',
}

export function tierName(tier: number): string {
	return TIER_NAMES[tier] ?? `Tier ${tier}`
}
