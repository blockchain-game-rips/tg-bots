import { buildActionData } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../actions'

const HOME_BUTTON_TEXT = 'Home'

declare module 'grammy' {
	interface InlineKeyboard {
		appendHomeButton(): this
	}
}

export function installKeyboardExtensions(): void {
	InlineKeyboard.prototype.appendHomeButton = function () {
		return this.text(
			HOME_BUTTON_TEXT,
			buildActionData(actionIds.openHome, undefined),
		)
	}
}
