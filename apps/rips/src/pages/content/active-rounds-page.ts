import { InlineKeyboard } from 'grammy'
import { Round } from '../../api/schemas'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { addNav, readableStake } from '../utils'
import { NON_FINISHED_STATUSES, displayStatus } from './round-statuses'

const MS_PER_MINUTE = 1000 * 60
const MS_PER_HOUR = MS_PER_MINUTE * 60

function roundLine(round: Round): string {
	const status = displayStatus(round.status)

	if (round.status !== 'FILLING') {
		return `  Round #${round.id} — ${status}`
	}

	const soldTickets = round.actions.purchases.reduce(
		(sum, p) => sum + BigInt(p.ticketAmount),
		0n,
	)
	const remainingTickets = round.stake.ticketCup - Number(soldTickets)

	const expiresAt =
		new Date(round.startTime).getTime() + round.stake.durationSeconds * 1000
	const remainingMs = expiresAt - Date.now()
	const remainingHours = Math.max(0, Math.floor(remainingMs / MS_PER_HOUR))
	const remainingMinutes = Math.max(
		0,
		Math.floor((remainingMs % MS_PER_HOUR) / MS_PER_MINUTE),
	)

	return (
		`  Round #${round.id} — ${status}` +
		` | ${remainingTickets} tickets left` +
		` | ${remainingHours}h ${remainingMinutes}m left`
	)
}

export class ActiveRoundsPage {
	static render(rounds: Round[]): PageContent {
		const activeRounds = rounds.filter((r) =>
			NON_FINISHED_STATUSES.includes(r.status),
		)

		const stakeIds = [...new Set(rounds.map((r) => r.stake.id))]

		const lines: string[] = []

		for (const stakeId of stakeIds) {
			const stakeRounds = activeRounds.filter(
				(r) => r.stake.id === stakeId,
			)
			const stakeRef = rounds.find((r) => r.stake.id === stakeId)

			if (stakeRef === undefined) continue

			if (lines.length > 0) lines.push('')

			lines.push(`Stake ${readableStake(stakeRef.stake)}`)

			const hasActiveRound = stakeRounds.some(
				(r) => r.status === 'FILLING',
			)

			if (!hasActiveRound) {
				lines.push('  Round ACTIVE — starts with first purchase')
			}

			for (const round of stakeRounds) {
				lines.push(roundLine(round))
			}
		}

		const message =
			lines.length > 0 ? lines.join('\n') : 'No ongoing rounds'

		return {
			message,
			keyboard: addNav(new InlineKeyboard(), {
				home: pageIds.home,
				parent: pageIds.status,
			}),
		}
	}
}
