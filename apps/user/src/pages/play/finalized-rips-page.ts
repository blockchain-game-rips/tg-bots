import { RipDto } from '@rips/api-client'
import {
	addNav,
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
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

const DETAILS_BUTTONS_PER_ROW = 2

const COMPLETED_LABEL = '✅ Completed'
const REFUNDED_LABEL = '↩️ Refunded'

function isCompleted(rip: RipDto): boolean {
	return groupRipStatus(rip.status) === RipStatusGroup.COMPLETED
}

function ripLines(rip: RipDto): Line[] {
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

function buildKeyboard(rips: RipDto[], mineOnly: boolean): InlineKeyboard {
	const keyboard = new InlineKeyboard()

	rips.forEach((rip, index) => {
		keyboard.text(
			`Rip #${rip.id.toString()} Details`,
			buildActionData(actionIds.openRipStatus, rip.id),
		)

		const isRowEnd = (index + 1) % DETAILS_BUTTONS_PER_ROW === 0
		const isLast = index === rips.length - 1

		if (isRowEnd || isLast) keyboard.row()
	})

	keyboard.text(
		mineOnly ? 'Show All' : 'Show Mine',
		buildActionData(actionIds.openFinalizedRips, !mineOnly),
	)

	return addNav(keyboard, {
		home: actionIds.openHome,
		parent: actionIds.openMyRips,
	})
}

export const FinalizedRipsPage = {
	render(rips: RipDto[], mineOnly: boolean): PageContent {
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
