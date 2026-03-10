import { InlineKeyboard } from 'grammy'
import { KeyboardLayout, Page, PageContent, WithKeyboard } from '../interfaces'
import { composeMarkup } from '../utils.ts/utils'

export class HomePage implements Page, WithKeyboard {
	constructor(readonly keyboardLayout: KeyboardLayout) {}

	render(): PageContent {
		return {
			message: 'Here is the home page',
			keyboard: new InlineKeyboard(composeMarkup(this.keyboardLayout)),
		}
	}
}
