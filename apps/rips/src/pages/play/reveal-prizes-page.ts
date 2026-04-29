import { InlineKeyboard } from 'grammy'
import { PrizeDto, RoundDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { addNav } from '../../utils/keyboard'
import { messageFromLines } from '../../utils/message'

export const REVEAL_ONE_PAYLOAD = 'one'
export const REVEAL_ALL_PAYLOAD = 'all'

export class RevealPrizesPage {
	static render(
		_rounds: RoundDto[],
		unrevealedPrizes: PrizeDto[],
	): PageContent {
		const lines: string[] = []

		lines.push(`Unrevealed tickets: ${unrevealedPrizes.length}`)

		const keyboard = new InlineKeyboard()

		if (unrevealedPrizes.length > 0) {
			keyboard
				.text(
					'Reveal next',
					buildActionData(
						actionIds.showRevealPrizes,
						REVEAL_ONE_PAYLOAD,
					),
				)
				.row()
				.text(
					'Reveal all',
					buildActionData(
						actionIds.showRevealPrizes,
						REVEAL_ALL_PAYLOAD,
					),
				)
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
