import { InlineKeyboard } from 'grammy'
import { RoundDto } from '../../../generated/api-client'
import { buildActionData } from '../../grammy-kit/action/action-data'
import { actionIds } from '../../grammy-kit/action/actions'
import { addNav } from '../../grammy-kit/keyboard/keyboard'
import { PageContent } from '../../types'

export const StatusPage = {
	render(ongoingRounds: RoundDto[], userEvmAddress: string): PageContent {
		const userRounds = ongoingRounds.filter((r) =>
			r.actions.purchases.some(
				(p) =>
					p.userAddress.toLowerCase() ===
					userEvmAddress.toLowerCase(),
			),
		)

		const lines: string[] = ['<b>Status</b>', '']

		if (userRounds.length === 0) {
			lines.push('You have no tickets in ongoing rounds.')
		} else {
			lines.push('🎟 <b>Your tickets in ongoing rounds</b>', '')

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

				const ticketLabel = userTickets === 1 ? 'ticket' : 'tickets'
				lines.push(
					`Round #${round.id.toString()} — ${userTickets.toString()} ${ticketLabel}`,
				)
			}
		}

		const keyboard = addNav(
			new InlineKeyboard()
				.text(
					'Ongoing rounds',
					buildActionData(actionIds.openOngoingRounds, undefined),
				)
				.row()
				.text(
					'Completed rounds',
					buildActionData(actionIds.openCompletedRounds, undefined),
				),
			{ home: actionIds.openHome, parent: actionIds.openPlay },
		)

		return { message: lines.join('\n'), keyboard }
	},
}
