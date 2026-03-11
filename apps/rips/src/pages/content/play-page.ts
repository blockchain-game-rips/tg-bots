import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { addNav, composeMarkup } from '../utils'

export class PlayPage {
	static render(): PageContent {
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
