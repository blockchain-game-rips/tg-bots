import { InlineKeyboard } from 'grammy'
import { InlineKeyboardButton } from 'grammy/types'
import { buildCommand } from '../../commands'
import { KeyboardLayout, NavIds } from '../interfaces'

export function composeMarkup(
	layout: KeyboardLayout,
): InlineKeyboardButton[][] {
	return [
		layout.map((button) => {
			return {
				text: button.label,
				callback_data: buildCommand({ type: 'open', pageId: button.pageId }),
			} as InlineKeyboardButton
		}),
	]
}

export function addNav(keyboard: InlineKeyboard, ids: NavIds) {
	keyboard.row().text('Back', buildCommand({ type: 'open', pageId: ids.parent }))

	if (ids.home !== ids.parent) {
		keyboard.text('Home', buildCommand({ type: 'open', pageId: ids.home }))
	}

	return keyboard
}
