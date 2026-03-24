import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { addNav, composeMarkup } from '../utils'

export class PlayPage {
	static render(hasUnrevealedPrizes: boolean): PageContent {
		const buttons: { label: string; pageId: string }[] = [
			{ label: 'Buy tickets', pageId: pageIds.chooseStake },
			{ label: 'Status', pageId: pageIds.status },
		]

		if (hasUnrevealedPrizes) {
			buttons.push({ label: 'Open Rips!', pageId: pageIds.openRips })
		}

		return {
			message: 'Play menu',
			keyboard: addNav(new InlineKeyboard(composeMarkup(buttons)), {
				home: pageIds.home,
				parent: pageIds.home,
			}),
		}
	}
}
