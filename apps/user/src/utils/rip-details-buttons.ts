import { RipDto } from '@rips/api-client'
import { buildActionData } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../actions'

const DETAILS_BUTTONS_PER_ROW = 2

export function addRipDetailsButtons(
	keyboard: InlineKeyboard,
	rips: RipDto[],
): InlineKeyboard {
	rips.forEach((rip, index) => {
		keyboard.text(
			`Rip #${rip.id.toString()} Details`,
			buildActionData(actionIds.openRipStatus, rip.id),
		)

		const isRowEnd = (index + 1) % DETAILS_BUTTONS_PER_ROW === 0
		const isLast = index === rips.length - 1

		if (isRowEnd || isLast) keyboard.row()
	})

	return keyboard
}
