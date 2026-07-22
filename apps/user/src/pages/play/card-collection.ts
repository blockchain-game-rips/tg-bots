import { GetCardCollectionResponseDtoOutput } from '@rips/api-client'
import { addNav, fmt, FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { tierName } from '../../utils/tiers'

type CollectedCard = GetCardCollectionResponseDtoOutput['tiers'][number][number]

function cardLine(card: CollectedCard): FormattedString {
	const count = card.count > 0 ? ` ×${card.count.toString()}` : ''
	return fmt`${FormattedString.a(card.card.name, card.card.imageUrl)} [${tierName(card.card.tier)}]${count}`
}

export const CardCollectionPage = {
	render(collection: GetCardCollectionResponseDtoOutput): PageContent {
		const allCards = collection.tiers.flat()
		const collectedCount = allCards.filter((c) => c.count > 0).length

		const lines: Line[] = [
			`Collected: ${collectedCount.toString()}/${allCards.length.toString()}`,
			'',
			...allCards.map(cardLine),
		]

		return {
			message: joinLines(lines),
			keyboard: addNav(new InlineKeyboard(), {
				parent: actionIds.openHome,
				home: actionIds.openHome,
			}),
		}
	},
}
