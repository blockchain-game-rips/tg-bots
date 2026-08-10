import {
	GetCardCollectionResponseDtoOutput,
	PayoutDtoOutput,
} from '@rips/api-client'
import { bestPull } from '../utils/best-pull'
import { Tier, TIERS } from '../utils/tiers'
import { CardCollection } from './card-collection'

/** Grouped rows are capped so a large batch never exceeds Telegram's 4096-character message limit. */
export const GROUPED_ROW_CAP = 30

export interface GroupedCardRow {
	cardId: number
	name: string
	imageUrl: string
	count: number
	totalPayout: string
}

export interface TierGroup {
	tier: Tier
	rows: GroupedCardRow[]
}

export interface RevealSummary {
	openedCount: number
	best: PayoutDtoOutput | undefined
	totalCredited: string
	newCount: number
	duplicateCount: number
	groups: TierGroup[]
	omittedRowCount: number
}

function collectedCardIds(collection: CardCollection): Set<number> {
	return new Set(
		collection.tiers.flatMap((tier) =>
			tier.collected.map((card) => card.id),
		),
	)
}

/**
 * The reveal increments collection counts server-side, so new-vs-duplicate is
 * only derivable by diffing against a snapshot taken before revealing.
 * Counted per distinct card id: four copies of an unowned card is one new card
 * and three duplicates.
 */
export function countNewAndDuplicates(
	preRevealCollection: CardCollection,
	revealedPayouts: PayoutDtoOutput[],
): { newCount: number; duplicateCount: number } {
	const owned = collectedCardIds(preRevealCollection)

	let newCount = 0
	let duplicateCount = 0

	for (const payout of revealedPayouts) {
		if (owned.has(payout.card.id)) {
			duplicateCount++
			continue
		}

		owned.add(payout.card.id)
		newCount++
	}

	return { newCount, duplicateCount }
}

export function isNewCard(
	preRevealCollection: CardCollection,
	cardId: number,
): boolean {
	return !collectedCardIds(preRevealCollection).has(cardId)
}

/**
 * Copies held before the reveal, keyed by card id. CardCollection tracks only
 * which cards are owned, so counts come from the raw collection response.
 */
export function copiesByCardId(
	collection: GetCardCollectionResponseDtoOutput,
): Map<number, number> {
	return new Map(
		collection.tiers.flatMap((entries) =>
			entries.map((entry): [number, number] => [
				entry.card.id,
				entry.count,
			]),
		),
	)
}

export function copiesOwnedAfterReveal(
	copiesBefore: Map<number, number>,
	cardId: number,
): number {
	return (copiesBefore.get(cardId) ?? 0) + 1
}

function collapseToRows(payouts: PayoutDtoOutput[]): GroupedCardRow[] {
	const rowsByCardId = new Map<number, GroupedCardRow>()

	for (const payout of payouts) {
		const existing = rowsByCardId.get(payout.card.id)

		if (existing === undefined) {
			rowsByCardId.set(payout.card.id, {
				cardId: payout.card.id,
				name: payout.card.name,
				imageUrl: payout.card.imageUrl,
				count: 1,
				totalPayout: payout.payoutAmount,
			})
			continue
		}

		existing.count++
		existing.totalPayout = (
			BigInt(existing.totalPayout) + BigInt(payout.payoutAmount)
		).toString()
	}

	return [...rowsByCardId.values()].sort((left, right) =>
		compareAmountsDescending(left.totalPayout, right.totalPayout),
	)
}

function compareAmountsDescending(left: string, right: string): number {
	const difference = BigInt(right) - BigInt(left)

	if (difference > 0n) return 1
	if (difference < 0n) return -1

	return 0
}

/** Truncates the tail only, so the summary always keeps its highest tiers. */
function capGroups(groups: TierGroup[]): {
	groups: TierGroup[]
	omittedRowCount: number
} {
	const totalRows = groups.reduce((sum, group) => sum + group.rows.length, 0)

	if (totalRows <= GROUPED_ROW_CAP) return { groups, omittedRowCount: 0 }

	const capped: TierGroup[] = []
	let remaining = GROUPED_ROW_CAP

	for (const group of groups) {
		if (remaining === 0) break

		const rows = group.rows.slice(0, remaining)

		remaining -= rows.length
		capped.push({ tier: group.tier, rows })
	}

	return { groups: capped, omittedRowCount: totalRows - GROUPED_ROW_CAP }
}

export function buildRevealSummary(
	preRevealCollection: CardCollection,
	revealedPayouts: PayoutDtoOutput[],
): RevealSummary {
	const totalCredited = revealedPayouts.reduce(
		(sum, payout) => sum + BigInt(payout.payoutAmount),
		0n,
	)

	const allGroups: TierGroup[] = TIERS.map((tier) => ({
		tier,
		rows: collapseToRows(
			revealedPayouts.filter((payout) => payout.card.tier === tier.index),
		),
	})).filter((group) => group.rows.length > 0)

	const { groups, omittedRowCount } = capGroups(allGroups)

	const { newCount, duplicateCount } = countNewAndDuplicates(
		preRevealCollection,
		revealedPayouts,
	)

	return {
		openedCount: revealedPayouts.length,
		best: bestPull(revealedPayouts),
		totalCredited: totalCredited.toString(),
		newCount,
		duplicateCount,
		groups,
		omittedRowCount,
	}
}
