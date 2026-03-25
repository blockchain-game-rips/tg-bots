import { InlineKeyboard } from 'grammy'
import { TicketPrize } from '../../api/schemas'
import { buildCommand } from '../../button-handler/utils'
import { PageContent } from '../../types'
import { formatUnits } from '../../utils/units'
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

			let totalPrize = 0n

			for (const prize of revealedPrizes) {
				const prizeAmount = BigInt(prize.prizeAmount)
				totalPrize += prizeAmount

				const formattedPrizeAmount = formatUnits(prizeAmount, 18)

				lines.push(
					`  Ticket #${prize.ticketNumber} — ${formattedPrizeAmount} ETH`,
				)
			}

			if (revealedPrizes.length > 1) {
				const formattedTotalPrize = formatUnits(totalPrize, 18)

				lines.push('')
				lines.push(`Total prize: ${formattedTotalPrize} ETH`)
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
				.row()
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
