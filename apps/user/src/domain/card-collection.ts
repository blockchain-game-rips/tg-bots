import {
	GetCardCollectionResponseDtoOutput,
	GetCardDefinitionsResponseDtoOutput,
} from '@rips/api-client'
import { Tier, TIERS } from '../utils/tiers'

export interface CollectedCard {
	id: number
	name: string
	imageUrl: string
}

export interface TierCollection {
	tier: Tier
	collected: CollectedCard[]
	lockedCount: number
	total: number
}

export interface CardCollection {
	tiers: TierCollection[]
	totalCollected: number
	totalCards: number
}

type Definitions = GetCardDefinitionsResponseDtoOutput
type Collection = GetCardCollectionResponseDtoOutput

function collectedIdsForTier(
	collection: Collection,
	tierIndex: number,
): Set<number> {
	const entries = collection.tiers[tierIndex] ?? []

	return new Set(
		entries
			.filter((entry) => entry.count > 0)
			.map((entry) => entry.card.id),
	)
}

function buildTierCollection(
	tier: Tier,
	definitions: Definitions,
	collection: Collection,
): TierCollection {
	const roster = definitions.tiers[tier.index] ?? []
	const collectedIds = collectedIdsForTier(collection, tier.index)

	const collected: CollectedCard[] = roster
		.filter((card) => collectedIds.has(card.id))
		.map((card) => ({
			id: card.id,
			name: card.name,
			imageUrl: card.imageUrl,
		}))

	return {
		tier,
		collected,
		lockedCount: roster.length - collected.length,
		total: roster.length,
	}
}

export function buildCardCollection(
	definitions: Definitions,
	collection: Collection,
): CardCollection {
	const tiers = TIERS.map((tier) =>
		buildTierCollection(tier, definitions, collection),
	)

	const totalCollected = tiers.reduce(
		(sum, tier) => sum + tier.collected.length,
		0,
	)
	const totalCards = tiers.reduce((sum, tier) => sum + tier.total, 0)

	return {
		tiers,
		totalCollected,
		totalCards,
	}
}

export function findTier(
	collection: CardCollection,
	tierIndex: number,
): TierCollection | undefined {
	return collection.tiers.find((tier) => tier.tier.index === tierIndex)
}
