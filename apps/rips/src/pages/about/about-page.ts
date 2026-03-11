import { InlineKeyboard } from 'grammy'
import { PageContent } from '../interfaces'
import { pageIds } from '../page-ids'
import { addNav } from '../utils.ts/utils'

export class AboutPage {
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
