import { BACK_ACTION_ID, buildActionData } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../action-ids'
import { BACK, HOME } from './button-labels'

declare module 'grammy' {
	interface InlineKeyboard {
		appendHomeButton(): this
		appendNavButtons(): this
	}
}

export function installKeyboardExtensions(): void {
	InlineKeyboard.prototype.appendHomeButton = function () {
		return this.text(HOME, buildActionData(actionIds.openHome, undefined))
	}

	InlineKeyboard.prototype.appendNavButtons = function () {
		return this.row().text(BACK, BACK_ACTION_ID).appendHomeButton()
	}
}
