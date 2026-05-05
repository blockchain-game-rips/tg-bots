import { InlineKeyboard } from 'grammy'
import { PrizeDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { addNav } from '../../utils/keyboard'

export class RevealPrizesPage {
	static render(unrevealedPrizes: PrizeDto[], showBack = true): PageContent {
		const lines: string[] = []

		lines.push(`Unrevealed tickets: ${unrevealedPrizes.length}`)

		const keyboard = new InlineKeyboard()

		if (unrevealedPrizes.length > 0) {
			keyboard
				.text(
					'Reveal next',
					buildActionData(actionIds.openRevealSingle),
				)
				.row()
				.text('Reveal all', buildActionData(actionIds.openRevealAll))
				.row()
		}

		if (showBack) {
			addNav(keyboard, {
				home: actionIds.openHome,
				parent: actionIds.openPlay,
			})
		} else {
			keyboard.row().text('Home', buildActionData(actionIds.openHome))
		}

		return {
			message: lines.join('\n'),
			keyboard,
		}
	}
}
