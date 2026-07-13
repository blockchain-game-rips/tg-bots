import { PayoutDto } from '@rips/api-client'
import { addNav, buildActionData } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

function buildRevealPayoutsContent(unrevealedPayouts: PayoutDto[]): {
	lines: string[]
	keyboard: InlineKeyboard
} {
	const lines = [
		'<b>Open Rips</b>',
		'',
		`🎟 Unrevealed entries: ${unrevealedPayouts.length.toString()}`,
	]

	if (unrevealedPayouts.length === 0) {
		lines.push('', 'All entries have been revealed.')
	}

	const keyboard = new InlineKeyboard()

	if (unrevealedPayouts.length > 0) {
		keyboard
			.text(
				'Reveal next',
				buildActionData(actionIds.openRevealSingle, undefined),
			)
			.row()
			.text(
				'Reveal all',
				buildActionData(actionIds.openRevealAll, undefined),
			)
			.row()
	}

	return { lines, keyboard }
}

export const RevealPayoutsPage = {
	render(unrevealedPayouts: PayoutDto[]): PageContent {
		const { lines, keyboard } = buildRevealPayoutsContent(unrevealedPayouts)

		addNav(keyboard, {
			home: actionIds.openHome,
			parent: actionIds.openHome,
		})

		return { message: lines.join('\n'), keyboard }
	},
}

export const RevealPayoutsNoBackPage = {
	render(unrevealedPayouts: PayoutDto[]): PageContent {
		const { lines, keyboard } = buildRevealPayoutsContent(unrevealedPayouts)

		keyboard.row().appendHomeButton()

		return { message: lines.join('\n'), keyboard }
	},
}
