import { PayoutDtoOutput, RipDtoOutput } from '@rips/api-client'
import {
	buildActionData,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import { formatAmountWithUsd } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../action-ids'
import { PageContent } from '../../types'
import * as labels from '../../utils/button-labels'
import { row } from '../../utils/page-row'
import { REVEAL_RESULT_SLOT } from './reveal-result-slot'
import { tierByIndex } from '../../utils/tiers'

const FLAVOUR_COPY = '🔥 Nice pull'

/** Only the top two tiers get flavour copy. */
const FLAVOUR_MIN_TIER = 5

export interface RevealSingleVariant {
	rip: RipDtoOutput
	revealedPayout: PayoutDtoOutput
	unopenedCount: number
	isNew: boolean
	collectionProgress: { collected: number; total: number }
	copiesOwned: number
}

function tierHeadline(tierIndex: number): string {
	const tier = tierByIndex(tierIndex)

	if (tier === undefined) return 'Pull'

	return `${tier.emoji} ${tier.name} Pull`
}

function collectionLines(variant: RevealSingleVariant): Line[] {
	const { isNew, collectionProgress, copiesOwned } = variant

	if (isNew) {
		return [
			'',
			'🆕 New card',
			...row(
				'Collection progress',
				`${collectionProgress.collected.toString()} / ${collectionProgress.total.toString()}`,
			),
		]
	}

	return [
		'',
		'♻️ Duplicate',
		...row('You now own', `${copiesOwned.toString()} copies`),
	]
}

export const RevealSinglePage = {
	render(variant: RevealSingleVariant): PageContent {
		const { rip, revealedPayout, unopenedCount } = variant

		const card = revealedPayout.card

		const lines: Line[] = [
			FormattedString.b(tierHeadline(card.tier)),
			...row('Card', FormattedString.a(card.name, card.imageUrl)),
			...row(
				'Payout',
				formatAmountWithUsd({
					amount: revealedPayout.payoutAmount,
					currency: rip.currency,
				}),
			),
			...collectionLines(variant),
		]

		if (card.tier >= FLAVOUR_MIN_TIER) lines.push('', FLAVOUR_COPY)

		lines.push(...row('Unopened pulls', unopenedCount.toString()))

		return {
			message: joinLines(lines),
			keyboard: buildKeyboard(unopenedCount),
			trailSlot: REVEAL_RESULT_SLOT,
		}
	},
}

function buildKeyboard(unopenedCount: number): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	if (unopenedCount > 0) {
		keyboard
			.text(
				labels.REVEAL_NEXT,
				buildActionData(actionIds.openRevealSingle, undefined),
			)
			.row()
			.text(
				labels.REVEAL_ALL,
				buildActionData(actionIds.openRevealAll, undefined),
			)
			.row()
	} else {
		keyboard
			.text(
				labels.ENTER_RIPS,
				buildActionData(actionIds.openChoosePreset, undefined),
			)
			.row()
	}

	keyboard
		.text(
			labels.VIEW_COLLECTION,
			buildActionData(actionIds.openCardCollection, undefined),
		)
		.row()

	return keyboard.appendNavButtons()
}
