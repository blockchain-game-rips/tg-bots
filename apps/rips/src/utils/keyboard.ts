import { InlineKeyboard } from 'grammy'
import { InlineKeyboardButton } from 'grammy/types'
import { KeyboardLayout, NavIds } from '../types'
import { buildActionData } from './action-data'

export function keyboardFromLayout(layout: KeyboardLayout) {
	return new InlineKeyboard(composeMarkup(layout))
}

export function composeMarkup(
	layout: KeyboardLayout,
): InlineKeyboardButton[][] {
	return layout.map((row) =>
		row.map((button) => ({
			text: button.label,
			callback_data: buildActionData(button.actionId, button.payload),
		})),
	)
}

export function addNav(keyboard: InlineKeyboard, ids: NavIds) {
	keyboard.row().text('Back', buildActionData(ids.parent))

	if (ids.home !== ids.parent) {
		keyboard.text('Home', buildActionData(ids.home))
	}

	return keyboard
}
