import { InlineKeyboard } from 'grammy'
import { Page, PageContent } from '../interfaces'
import { pageIds } from '../page-ids'
import { addNav } from '../utils.ts/utils'

export class AboutPage implements Page {
	render(): PageContent {
		return {
			message: 'description of game',
			keyboard: addNav(new InlineKeyboard(), {
				home: pageIds.home,
				parent: pageIds.home,
			}),
		}
	}
}
