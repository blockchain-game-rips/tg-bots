import { InlineKeyboard } from 'grammy'
import { RoundDto } from '../../../generated/api-client'
import { buildCommand } from '../../button-handler/utils'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { addNav } from '../utils'

export class StatusPage {
	static render(
		ongoingRounds: RoundDto[],
		userEvmAddress: string,
	): PageContent {
		const userRounds = ongoingRounds.filter((r) =>
			r.actions.purchases.some(
				(p) =>
					p.userAddress.toLowerCase() ===
					userEvmAddress.toLowerCase(),
			),
		)

		const lines: string[] = []

		if (userRounds.length === 0) {
			lines.push('You have no tickets in ongoing rounds')
		} else {
			lines.push('Your tickets in ongoing rounds:')
			lines.push('')

			for (const round of userRounds) {
				const userTickets = round.actions.purchases
					.filter(
						(p) =>
							p.userAddress.toLowerCase() ===
							userEvmAddress.toLowerCase(),
					)
					.reduce(
						(sum, purchase) => sum + Number(purchase.ticketCount),
						0,
					)

				lines.push(`Round #${round.id} — ${userTickets} ticket(s)`)
			}
		}

		const keyboard = addNav(
			new InlineKeyboard()
				.text(
					'Ongoing rounds',
					buildCommand({
						type: 'open',
						pageId: pageIds.ongoingRounds,
						payloads: [],
					}),
				)
				.row()
				.text(
					'Completed rounds',
					buildCommand({
						type: 'open',
						pageId: pageIds.completedRounds,
						payloads: [],
					}),
				),
			{ home: pageIds.home, parent: pageIds.play },
		)

		return { message: lines.join('\n'), keyboard }
	}
}
