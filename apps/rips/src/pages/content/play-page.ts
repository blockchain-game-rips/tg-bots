import { InlineKeyboard } from 'grammy'
import { KeyboardLayout, PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { addNav, composeMarkup } from '../utils'

export class PlayPage {
	static render(hasUnrevealedPrizes: boolean): PageContent {
		const buttons: KeyboardLayout = [
			{ label: 'Buy tickets', pageId: pageIds.chooseStake },
			'row',
			{ label: 'Status', pageId: pageIds.status },
		]

		if (hasUnrevealedPrizes) {
			buttons.push({ label: 'Open Rips!', pageId: pageIds.openRips })
		}

		return {
			message:
				'Buy tickets to enter the game, or check your tickets and round statuses in Status.',
			keyboard: addNav(new InlineKeyboard(composeMarkup(buttons)), {
				home: pageIds.home,
				parent: pageIds.home,
			}),
		}
	}
}
