import { InlineKeyboard } from 'grammy'
import { NavIds } from '../../types'
import { buildActionData } from '../action/action-data'

export function addNav(keyboard: InlineKeyboard, ids: NavIds): InlineKeyboard {
	if ('parentPayload' in ids) {
		keyboard
			.row()
			.text('Back', buildActionData(ids.parent, ids.parentPayload))
	} else {
		keyboard.row().text('Back', buildActionData(ids.parent, undefined))
	}

	if (ids.home !== ids.parent) {
		keyboard.text('Home', buildActionData(ids.home, undefined))
	}

	return keyboard
}
