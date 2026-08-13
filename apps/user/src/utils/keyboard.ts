import { BACK_ACTION_ID, buildActionData } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../actions'

const BACK_BUTTON_TEXT = '⬅️ Back'
const HOME_BUTTON_TEXT = '🏠 Home'

declare module 'grammy' {
	interface InlineKeyboard {
		appendHomeButton(): this
		appendNavButtons(): this
	}
}

export function installKeyboardExtensions(): void {
	InlineKeyboard.prototype.appendHomeButton = function () {
		return this.text(
			HOME_BUTTON_TEXT,
			buildActionData(actionIds.openHome, undefined),
		)
	}

	InlineKeyboard.prototype.appendNavButtons = function () {
		return this.row()
			.text(BACK_BUTTON_TEXT, BACK_ACTION_ID)
			.appendHomeButton()
	}
}
