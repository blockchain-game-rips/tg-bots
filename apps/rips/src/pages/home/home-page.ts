import { InlineKeyboard } from 'grammy'
import { KeyboardLayout, Page, Renderable, WithKeyboard } from '../interfaces'
import { composeMarkup } from '../utils.ts/utils'

export class HomePage implements Renderable, WithKeyboard {
	constructor(readonly keyboardLayout: KeyboardLayout) {}

	render(): Page {
		return {
			message: 'Here is the home page',
			keyboard: new InlineKeyboard(composeMarkup(this.keyboardLayout)),
		}
	}
}
