import { InlineKeyboard } from 'grammy'
import { GetCardCollectionResponseDtoOutput } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { addNav } from '../../utils'

type CollectedCard = GetCardCollectionResponseDtoOutput['tiers'][number][number]

function cardLine(card: CollectedCard): string {
	const count = card.count > 0 ? ` ×${card.count}` : ''
	return `<a href="${card.card.imageUrl}">${card.card.name}</a>${count}`
}

export class CardCollectionPage {
	static render(collection: GetCardCollectionResponseDtoOutput): PageContent {
		const allCards = collection.tiers.flat()
		const collectedCount = allCards.filter((c) => c.count > 0).length

		const lines = [
			`Collected: ${collectedCount}/${allCards.length}`,
			'',
			...allCards.map(cardLine),
		]

		return {
			message: lines.join('\n'),
			keyboard: addNav(new InlineKeyboard(), {
				parent: actionIds.showCardChooseStake,
				home: actionIds.showHome,
			}),
		}
	}
}
