import { InlineKeyboard } from 'grammy'
import { PrizeDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { addNav } from '../../utils/keyboard'
import { messageFromLines } from '../../utils/message'

export class RevealPrizesPage {
	static render(unrevealedPrizes: PrizeDto[]): PageContent {
		const lines: string[] = []

		lines.push(`Unrevealed tickets: ${unrevealedPrizes.length}`)

		const keyboard = new InlineKeyboard()

		if (unrevealedPrizes.length > 0) {
			keyboard
				.text(
					'Reveal next',
					buildActionData(actionIds.showRevealSingle),
				)
				.row()
				.text('Reveal all', buildActionData(actionIds.showRevealAll))
				.row()
		}

		return {
			message: messageFromLines(lines),
			keyboard: addNav(keyboard, {
				home: actionIds.showHome,
				parent: actionIds.showPlay,
			}),
		}
	}
}
