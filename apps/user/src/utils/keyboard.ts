import { buildActionData, NavIds } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../actions'

const BACK_BUTTON_TEXT = '⬅️ Back'
const HOME_BUTTON_TEXT = '🏠 Home'

declare module 'grammy' {
	interface InlineKeyboard {
		appendHomeButton(): this
		appendNavButtons(ids: NavIds): this
	}
}

export function installKeyboardExtensions(): void {
	InlineKeyboard.prototype.appendHomeButton = function () {
		return this.text(
			HOME_BUTTON_TEXT,
			buildActionData(actionIds.openHome, undefined),
		)
	}

	InlineKeyboard.prototype.appendNavButtons = function (ids: NavIds) {
		const parentPayload =
			'parentPayload' in ids ? ids.parentPayload : undefined

		this.row().text(
			BACK_BUTTON_TEXT,
			buildActionData(ids.parent, parentPayload),
		)

		if (ids.home !== ids.parent) {
			this.appendHomeButton()
		}

		return this
	}
}
