import { InlineKeyboard } from 'grammy'
import { Page, PageContent } from '../interfaces'
import { pageIds } from '../page-ids'
import { addNav, composeMarkup } from '../utils.ts/utils'

export class PlayPage implements Page {
	render(): PageContent {
		return {
			message: 'Play menu',
			keyboard: addNav(
				new InlineKeyboard(
					composeMarkup([
						{ label: 'Buy tickets', pageId: pageIds.chooseStake },
					]),
				),
				{ home: pageIds.home, parent: pageIds.home },
			),
		}
	}
}
