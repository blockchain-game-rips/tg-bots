import {
	GetCardCollectionResponseDtoOutput,
	GetCardDefinitionsResponseDtoOutput,
} from '@rips/api-client'
import { describe, expect, it } from 'vitest'
import { buildCardCollection } from '../src/domain/card-collection'

type Definition = GetCardDefinitionsResponseDtoOutput['tiers'][number][number]
type Collected = GetCardCollectionResponseDtoOutput['tiers'][number][number]

const RARE_INDEX = 3
const COMMON_INDEX = 1

function def(id: number, tier: number, name: string): Definition {
	return { id, tier, name, imageUrl: `https://img/${id.toString()}` }
}

function definitionsWith(
	cards: Definition[],
): GetCardDefinitionsResponseDtoOutput {
	const tiers: Definition[][] = []

	for (const card of cards) {
		;(tiers[card.tier] ??= []).push(card)
	}

	return { tiers }
}

function collectedFrom(cards: Collected[]): GetCardCollectionResponseDtoOutput {
	const tiers: Collected[][] = []

	for (const card of cards) {
		;(tiers[card.card.tier] ??= []).push(card)
	}

	return { tiers }
}

describe('buildCardCollection', () => {
	it('returns all seven tiers in display order, best first', () => {
		const result = buildCardCollection(
			definitionsWith([]),
			collectedFrom([]),
		)

		expect(result.tiers.map((t) => t.tier.name)).toEqual([
			'Mythic',
			'Legendary',
			'Epic',
			'Rare',
			'Spark',
			'Common',
			'Dust',
		])
	})

	it('marks a card with count > 0 as collected and the rest as locked', () => {
		const rare1 = def(1, RARE_INDEX, 'Rare One')
		const rare2 = def(2, RARE_INDEX, 'Rare Two')
		const rare3 = def(3, RARE_INDEX, 'Rare Three')

		const result = buildCardCollection(
			definitionsWith([rare1, rare2, rare3]),
			collectedFrom([{ card: rare2, count: 4 }]),
		)

		const rareTier = result.tiers.find((t) => t.tier.name === 'Rare')

		expect(rareTier).toBeDefined()
		expect(rareTier?.total).toBe(3)
		expect(rareTier?.collected.map((c) => c.name)).toEqual(['Rare Two'])
		expect(rareTier?.lockedCount).toBe(2)
	})

	it('orders collected cards before locked slots implicitly via separate lists', () => {
		const common1 = def(10, COMMON_INDEX, 'Common A')
		const common2 = def(11, COMMON_INDEX, 'Common B')

		const result = buildCardCollection(
			definitionsWith([common1, common2]),
			collectedFrom([{ card: common1, count: 1 }]),
		)

		const tier = result.tiers.find((t) => t.tier.name === 'Common')

		expect(tier?.collected).toHaveLength(1)
		expect(tier?.lockedCount).toBe(1)
	})

	it('counts distinct collected cards across all tiers for the grand total', () => {
		const rare1 = def(1, RARE_INDEX, 'Rare One')
		const common1 = def(10, COMMON_INDEX, 'Common A')
		const common2 = def(11, COMMON_INDEX, 'Common B')

		const result = buildCardCollection(
			definitionsWith([rare1, common1, common2]),
			collectedFrom([
				{ card: rare1, count: 2 },
				{ card: common1, count: 1 },
			]),
		)

		expect(result.totalCollected).toBe(2)
		expect(result.totalCards).toBe(3)
	})

	it('ignores collection entries with a count of zero', () => {
		const rare1 = def(1, RARE_INDEX, 'Rare One')

		const result = buildCardCollection(
			definitionsWith([rare1]),
			collectedFrom([{ card: rare1, count: 0 }]),
		)

		const tier = result.tiers.find((t) => t.tier.name === 'Rare')

		expect(tier?.collected).toHaveLength(0)
		expect(tier?.lockedCount).toBe(1)
		expect(result.totalCollected).toBe(0)
	})
})
