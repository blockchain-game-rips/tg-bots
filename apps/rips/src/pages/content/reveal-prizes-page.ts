import { InlineKeyboard } from 'grammy'
import { TicketPrize } from '../../api/schemas'
import { buildCommand } from '../../commands'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { addNav } from '../utils'

export const REVEAL_ONE_PAYLOAD = 'one'
export const REVEAL_ALL_PAYLOAD = 'all'

export class RevealPrizesPage {
	static render(
		unrevealedPrizes: TicketPrize[],
		revealedPrizes: TicketPrize[] = [],
	): PageContent {
		const lines: string[] = []

		if (revealedPrizes.length > 0) {
			if (revealedPrizes.length === 1) {
				lines.push('Your prize:')
			} else {
				lines.push('Your prizes:')
			}

			for (const prize of revealedPrizes) {
				lines.push(
					`  Ticket #${prize.ticketNumber} — ${prize.prizeAmount}`,
				)
			}

			lines.push('')
		}

		lines.push(`Unrevealed tickets: ${unrevealedPrizes.length}`)

		const keyboard = new InlineKeyboard()

		if (unrevealedPrizes.length > 0) {
			keyboard
				.text(
					'Reveal next',
					buildCommand({
						type: 'open',
						pageId: pageIds.revealPrizes,
						payloads: [REVEAL_ONE_PAYLOAD],
					}),
				)
				.text(
					'Reveal all',
					buildCommand({
						type: 'open',
						pageId: pageIds.revealPrizes,
						payloads: [REVEAL_ALL_PAYLOAD],
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
