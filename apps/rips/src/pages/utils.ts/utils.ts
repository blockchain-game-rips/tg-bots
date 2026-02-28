import { InlineKeyboard } from 'grammy'
import { InlineKeyboardButton } from 'grammy/types'
import { KeyboardLayout, NavIds } from '../interfaces'

export function composeMarkup(
	layout: KeyboardLayout,
): InlineKeyboardButton[][] {
	return [
		layout.map((button) => {
			return {
				text: button.label,
				callback_data: button.pageId,
			} as InlineKeyboardButton
		}),
	]
}

export function addNav(keyboard: InlineKeyboard, ids: NavIds) {
	keyboard.row().text('Back', ids.parent)

	if (ids.home !== ids.parent) {
		keyboard.text('Home', ids.home)
	}

	return keyboard
}
