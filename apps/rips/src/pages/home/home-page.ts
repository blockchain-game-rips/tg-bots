import { InlineKeyboard } from 'grammy'
import { Page, PageContent } from '../interfaces'
import { pageIds } from '../page-ids'
import { composeMarkup } from '../utils.ts/utils'

export class HomePage implements Page {
	render(): PageContent {
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
