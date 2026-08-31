import {
	buildActionData,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../action-ids'
import { CardCollection } from '../../domain/card-collection'
import { PageContent } from '../../types'

const TITLE = '🃏 Collection'

function progressLine(collected: number, total: number): string {
	return `${collected.toString()} / ${total.toString()}`
}

export const CardCollectionPage = {
	render(collection: CardCollection): PageContent {
		const progressByTier = collection.tiers.map(
			(tier) =>
				`${tier.tier.emoji} ${tier.tier.name}: ${progressLine(tier.collected.length, tier.total)}`,
		)

		const lines: Line[] = [
			FormattedString.b(TITLE),
			'',
			'Collected:',
			progressLine(collection.totalCollected, collection.totalCards),
			'',
			'Progress by tier:',
			'',
			...progressByTier,
			'',
			'Cards are cosmetic collectibles.',
			'Duplicates are possible.',
			'',
			'View by Tier:',
		]

		const keyboard = new InlineKeyboard()

		for (const tier of collection.tiers) {
			keyboard
				.text(
					tier.tier.name,
					buildActionData(
						actionIds.openCardCollectionTier,
						tier.tier.index,
					),
				)
				.row()
		}

		return {
			message: joinLines(lines),
			keyboard: keyboard.appendNavButtons(),
		}
	},
}
