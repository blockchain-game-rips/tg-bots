import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { composeMarkup } from '../utils'

export class HomePage {
	static render(): PageContent {
		return {
			message: 'Here is the home page',
			keyboard: new InlineKeyboard(
				composeMarkup([
					{ label: 'About', pageId: pageIds.about },
					{ label: 'Play', pageId: pageIds.play },
				]),
			),
		}
	}
}
