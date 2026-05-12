import { InlineKeyboard } from 'grammy'
import { PrizeDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { addNav } from '../../utils/keyboard'

function buildRevealPrizesContent(unrevealedPrizes: PrizeDto[]): {
	lines: string[]
	keyboard: InlineKeyboard
} {
	const lines = [
		'<b>Open Rips</b>',
		'',
		`🎟 Unrevealed tickets: ${unrevealedPrizes.length.toString()}`,
	]

	if (unrevealedPrizes.length === 0) {
		lines.push('', 'All tickets have been revealed.')
	}

	const keyboard = new InlineKeyboard()

	if (unrevealedPrizes.length > 0) {
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

export const RevealPrizesPage = {
	render(unrevealedPrizes: PrizeDto[]): PageContent {
		const { lines, keyboard } = buildRevealPrizesContent(unrevealedPrizes)

		addNav(keyboard, {
			home: actionIds.openHome,
			parent: actionIds.openPlay,
		})

		return { message: lines.join('\n'), keyboard }
	},
}

export const RevealPrizesNoBackPage = {
	render(unrevealedPrizes: PrizeDto[]): PageContent {
		const { lines, keyboard } = buildRevealPrizesContent(unrevealedPrizes)

		keyboard
			.row()
			.text('Home', buildActionData(actionIds.openHome, undefined))

		return { message: lines.join('\n'), keyboard }
	},
}
