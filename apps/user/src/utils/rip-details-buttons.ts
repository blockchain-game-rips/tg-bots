import { RipDtoOutput } from '@rips/api-client'
import { buildActionData } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../actions'
import { ripDetailsLabel } from './button-labels'

const DETAILS_BUTTONS_PER_ROW = 2

export function addRipDetailsButtons(
	keyboard: InlineKeyboard,
	rips: RipDtoOutput[],
): InlineKeyboard {
	rips.forEach((rip, index) => {
		keyboard.text(
			ripDetailsLabel(rip.id.toString()),
			buildActionData(actionIds.openRipStatus, rip.id),
		)

		const isRowEnd = (index + 1) % DETAILS_BUTTONS_PER_ROW === 0
		const isLast = index === rips.length - 1

		if (isRowEnd || isLast) keyboard.row()
	})

	return keyboard
}
