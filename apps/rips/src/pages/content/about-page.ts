import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { addNav } from '../utils'

export class AboutPage {
	static render(): PageContent {
		return {
			message: 'description of game',
			keyboard: addNav(new InlineKeyboard(), {
				home: pageIds.home,
				parent: pageIds.home,
			}),
		}
	}
}
