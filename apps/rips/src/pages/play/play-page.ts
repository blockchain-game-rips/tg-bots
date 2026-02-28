import { InlineKeyboard } from 'grammy'
import {
	KeyboardLayout,
	NavIds,
	Page,
	Renderable,
	WithKeyboard,
	WithNav,
} from '../interfaces'
import { addNav, composeMarkup } from '../utils.ts/utils'

export class PlayPage implements Renderable, WithKeyboard, WithNav {
	constructor(
		readonly keyboardLayout: KeyboardLayout,
		readonly navIds: NavIds,
	) {}

	render(): Page {
		return {
			message: 'Play menu',
			keyboard: addNav(
				new InlineKeyboard(composeMarkup(this.keyboardLayout)),
				this.navIds,
			),
		}
	}
}
