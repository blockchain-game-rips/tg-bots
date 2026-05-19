import { GetCardCollectionResponseDtoOutput } from '@rips/api-client'
import { addNav } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { tierName } from '../../utils/tiers'

type CollectedCard = GetCardCollectionResponseDtoOutput['tiers'][number][number]

function cardLine(card: CollectedCard): string {
	const count = card.count > 0 ? ` ×${card.count.toString()}` : ''
	return `<a href="${card.card.imageUrl}">${card.card.name}</a> [${tierName(card.card.tier)}]${count}`
}

export const CardCollectionPage = {
	render(collection: GetCardCollectionResponseDtoOutput): PageContent {
		const allCards = collection.tiers.flat()
		const collectedCount = allCards.filter((c) => c.count > 0).length

		const lines = [
			`Collected: ${collectedCount.toString()}/${allCards.length.toString()}`,
			'',
			...allCards.map(cardLine),
		]

		return {
			message: lines.join('\n'),
			keyboard: addNav(new InlineKeyboard(), {
				parent: actionIds.openCardChooseStake,
				home: actionIds.openHome,
			}),
		}
	},
}
