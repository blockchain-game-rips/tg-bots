import { InlineKeyboard } from 'grammy'
import { PrizeDto, RoundDto } from '../../../../generated/api-client'
import { buildCommand } from '../../../button-handler/utils'
import { PageContent } from '../../../types'
import { pageIds } from '../../page-ids'
import { addNav } from '../../utils'

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
					buildCommand({
						type: 'open',
						pageId: pageIds.revealSingle,
						payloads: [],
					}),
				)
				.row()
				.text(
					'Reveal all',
					buildCommand({
						type: 'open',
						pageId: pageIds.revealAll,
						payloads: [],
					}),
				)
				.row()
		}

		return {
			message: lines.join('\n'),
			keyboard: addNav(keyboard, {
				home: pageIds.home,
				parent: pageIds.play,
			}),
		}
	}
}
