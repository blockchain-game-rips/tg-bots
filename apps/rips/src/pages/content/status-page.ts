import { InlineKeyboard } from 'grammy'
import { Round } from '../../api/schemas'
import { buildCommand } from '../../button-handler/utils'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { addNav, readableStake } from '../utils'
import { NON_FINISHED_STATUSES } from './round-statuses'

export class StatusPage {
	static render(rounds: Round[], userEvmAddress: string): PageContent {
		const ongoingRounds = rounds.filter((r) =>
			NON_FINISHED_STATUSES.includes(r.status),
		)

		const userRounds = ongoingRounds.filter((r) =>
			r.actions.purchases.some(
				(p) =>
					p.userAddress.toLowerCase() ===
					userEvmAddress.toLowerCase(),
			),
		)

		const stakeIds = [...new Set(userRounds.map((r) => r.stake.id))]

		const lines: string[] = []

		if (stakeIds.length === 0) {
			lines.push('You have no tickets in ongoing rounds')
		} else {
			lines.push('Your tickets in ongoing rounds:')

			for (const stakeId of stakeIds) {
				const stakeRounds = userRounds.filter(
					(r) => r.stake.id === stakeId,
				)

				lines.push('')
				lines.push(`${readableStake(stakeRounds[0].stake)} stake:`)

				for (const round of stakeRounds) {
					const userTickets = round.actions.purchases
						.filter(
							(p) =>
								p.userAddress.toLowerCase() ===
								userEvmAddress.toLowerCase(),
						)
						.reduce((sum, p) => sum + Number(p.ticketAmount), 0)

					lines.push(
						`  Round #${round.id} — ${userTickets} ticket(s)`,
					)
				}
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
