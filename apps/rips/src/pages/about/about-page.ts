import { InlineKeyboard } from 'grammy'
import { NavIds, Page, Renderable, WithNav } from '../interfaces'
import { addNav } from '../utils.ts/utils'

export class AboutPage implements Renderable, WithNav {
	constructor(readonly navIds: NavIds) {}

	render(): Page {
		return {
			message: 'description of game',
			keyboard: addNav(new InlineKeyboard(), this.navIds),
		}
	}
}
