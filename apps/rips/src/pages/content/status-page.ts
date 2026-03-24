import { InlineKeyboard } from 'grammy'
import { Round, RoundStatus } from '../../api/schemas'
import { buildCommand } from '../../commands'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { addNav, readableStake } from '../utils'

const FINISHED_STATUSES: RoundStatus[] = ['CLAIMED', 'REFUNDED']

function roundStatusLine(round: Round): string {
	if (round.status !== 'FILLING') {
		return `  Round #${round.id} — ${round.status}`
	}

	const soldTickets = round.actions.purchases.reduce(
		(sum, p) => sum + BigInt(p.ticketAmount),
		0n,
	)
	const remainingTickets = round.stake.ticketCup - Number(soldTickets)

	const expiresAt =
		new Date(round.startTime).getTime() + round.stake.durationSeconds * 1000
	const remainingMs = expiresAt - Date.now()
	const remainingHours = Math.max(
		0,
		Math.floor(remainingMs / (1000 * 60 * 60)),
	)
	const remainingMinutes = Math.max(
		0,
		Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60)),
	)

	return (
		`  Round #${round.id} — ${round.status}` +
		` | ${remainingTickets} tickets left` +
		` | ${remainingHours}h ${remainingMinutes}m left`
	)
}

export class StatusPage {
	static render(rounds: Round[]): PageContent {
		const activeRounds = rounds.filter(
			(r) => !FINISHED_STATUSES.includes(r.status),
		)

		const stakeIds = [...new Set(activeRounds.map((r) => r.stake.id))]

		const lines: string[] = []

		for (const stakeId of stakeIds) {
			const stakeRounds = activeRounds.filter(
				(r) => r.stake.id === stakeId,
			)

			if (lines.length > 0) lines.push('')

			lines.push(`Stake ${readableStake(stakeRounds[0].stake)}`)

			for (const round of stakeRounds) {
				lines.push(roundStatusLine(round))
			}
		}

		const message = lines.length > 0 ? lines.join('\n') : 'No active rounds'

		const keyboard = addNav(
			new InlineKeyboard().text(
				'Finished rounds',
				buildCommand({ type: 'open', pageId: pageIds.finishedRounds }),
			),
			{ home: pageIds.home, parent: pageIds.play },
		)

		return { message, keyboard }
	}
}
