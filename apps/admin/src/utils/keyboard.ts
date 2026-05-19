import { ActionId, buildActionData } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { InlineKeyboardButton } from 'grammy/types'
import { KeyboardLayout } from '../types'

export function keyboardFromLayout(layout: KeyboardLayout) {
	return new InlineKeyboard(composeMarkup(layout))
}

export function composeMarkup(
	layout: KeyboardLayout,
): InlineKeyboardButton[][] {
	return layout.map((row) =>
		row.map((button) => ({
			text: button.label,
			callback_data: buildActionData(
				button.actionId as ActionId<string | undefined>,
				button.payload,
			),
		})),
	)
}
