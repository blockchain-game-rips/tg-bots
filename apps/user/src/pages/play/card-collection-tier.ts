import { addNav, fmt, FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { TierCollection } from '../../domain/card-collection'
import { PageContent } from '../../types'

const COLLECTED_MARK = '✅'
const LOCKED_MARK = '🔒'

export const CardCollectionTierPage = {
	render(tierCollection: TierCollection): PageContent {
		const { tier, collected, lockedCount } = tierCollection

		const collectedLines: FormattedString[] = collected.map(
			(card) =>
				fmt`${COLLECTED_MARK} ${FormattedString.a(card.name, card.imageUrl)}`,
		)

		const lockedLine: Line[] =
			lockedCount > 0
				? [`${LOCKED_MARK} ${lockedCount.toString()} still locked`]
				: []

		const lines: Line[] = [
			FormattedString.b(`${tier.emoji} ${tier.name} Cards`),
			'',
			'Collected:',
			`${collected.length.toString()} / ${tierCollection.total.toString()}`,
			'',
			...collectedLines,
			...lockedLine,
		]

		return {
			message: joinLines(lines),
			keyboard: addNav(new InlineKeyboard(), {
				parent: actionIds.openCardCollection,
				home: actionIds.openHome,
			}),
		}
	},
}
