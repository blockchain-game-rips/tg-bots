import { InlineKeyboard } from 'grammy'
import { Round, RoundStatus } from '../../api/schemas'
import { buildCommand } from '../../button-handler/utils'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { addNav, readableStake } from '../utils'

const FINISHED_STATUSES: RoundStatus[] = ['CLAIMED', 'REFUNDED']

export class StatusPage {
	static render(rounds: Round[], userEvmAddress: string): PageContent {
		const activeRounds = rounds.filter(
			(r) => !FINISHED_STATUSES.includes(r.status),
		)

		const userRounds = activeRounds.filter((r) =>
			r.actions.purchases.some(
				(p) =>
					p.userAddress.toLowerCase() ===
					userEvmAddress.toLowerCase(),
			),
		)

		const stakeIds = [...new Set(userRounds.map((r) => r.stake.id))]

		const lines: string[] = []

		if (stakeIds.length === 0) {
			lines.push("You don't have tickets in active rounds")
		} else {
			lines.push('You have tickets:')

			for (const stakeId of stakeIds) {
				const stakeRounds = userRounds.filter(
					(r) => r.stake.id === stakeId,
				)

				lines.push('')
				lines.push(`Stake ${readableStake(stakeRounds[0].stake)}`)

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
					'Active rounds',
					buildCommand({
						type: 'open',
						pageId: pageIds.activeRounds,
						payloads: [],
					}),
				)
				.text(
					'Finished rounds',
					buildCommand({
						type: 'open',
						pageId: pageIds.finishedRounds,
						payloads: [],
					}),
				),
			{ home: pageIds.home, parent: pageIds.play },
		)

		return { message: lines.join('\n'), keyboard }
	}
}
