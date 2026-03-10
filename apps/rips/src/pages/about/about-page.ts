import { InlineKeyboard } from 'grammy'
import { NavIds, Page, PageContent, WithNav } from '../interfaces'
import { addNav } from '../utils.ts/utils'

export class AboutPage implements Page, WithNav {
	constructor(readonly navIds: NavIds) {}

	render(): PageContent {
		return {
			message: 'description of game',
			keyboard: addNav(new InlineKeyboard(), this.navIds),
		}
	}
}
