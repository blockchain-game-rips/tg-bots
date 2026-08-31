import { RipDtoOutput } from '@rips/api-client'
import {
	buildActionData,
	fmt,
	FormattedString,
	joinLines,
	Line,
} from '@rips/grammy-kit'
import {
	formatAmountWithUsd,
	groupRipStatus,
	RipStatusGroup,
} from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../action-ids'
import { PageContent } from '../../types'
import { addRipDetailsButtons } from '../../utils/rip-details-buttons'
import * as labels from '../../utils/button-labels'

const COMPLETED_LABEL = '✅ Completed'
const REFUNDED_LABEL = '↩️ Refunded'

function isCompleted(rip: RipDtoOutput): boolean {
	return groupRipStatus(rip.status) === RipStatusGroup.COMPLETED
}

function ripLines(rip: RipDtoOutput): Line[] {
	const lines: Line[] = [
		fmt`🎮 ${FormattedString.b(`Rip #${rip.id.toString()}`)}`,
		`Entry level: ${formatAmountWithUsd(rip.config.entryPrice)}`,
	]

	const completed = isCompleted(rip)

	if (completed) {
		lines.push(`Entries: ${rip.config.entryCap.toString()}`)
	}

	lines.push(`Status: ${completed ? COMPLETED_LABEL : REFUNDED_LABEL}`)

	return lines
}

function buildKeyboard(
	rips: RipDtoOutput[],
	mineOnly: boolean,
): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	addRipDetailsButtons(keyboard, rips)

	keyboard.text(
		mineOnly ? labels.SHOW_ALL : labels.SHOW_MINE,
		buildActionData(actionIds.openFinalizedRips, !mineOnly),
	)

	return keyboard.appendNavButtons()
}

export const FinalizedRipsPage = {
	render(rips: RipDtoOutput[], mineOnly: boolean): PageContent {
		const lines: Line[] = [
			fmt`🏁 ${FormattedString.b('Last Finalized Rips')}`,
		]

		for (const rip of rips) {
			lines.push('', ...ripLines(rip))
		}

		if (rips.length === 0) {
			lines.push('', 'No finalized rips yet')
		}

		return {
			message: joinLines(lines),
			keyboard: buildKeyboard(rips, mineOnly),
		}
	},
}
