import { InlineKeyboard } from 'grammy'
import {
	KeyboardLayout,
	NavIds,
	Page,
	PageContent,
	WithKeyboard,
	WithNav,
} from '../interfaces'
import { addNav, composeMarkup } from '../utils.ts/utils'

export class PlayPage implements Page, WithKeyboard, WithNav {
	constructor(
		readonly keyboardLayout: KeyboardLayout,
		readonly navIds: NavIds,
	) {}

	render(): PageContent {
		return {
			message: 'Play menu',
			keyboard: addNav(
				new InlineKeyboard(composeMarkup(this.keyboardLayout)),
				this.navIds,
			),
		}
	}
}
