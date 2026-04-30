import { InlineKeyboard } from 'grammy'
import { AvailableStakeDto, RoundDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { toShortDurationFormat } from '../../utils/duration'
import { addNav } from '../../utils/keyboard'
import { displayStatus } from '../../utils/round-statuses'
import { configName, resolveConfig } from '../../utils/stake'

function roundLine(round: RoundDto): string {
	const status = displayStatus(round.status)

	if (round.status !== 'FILLING') {
		return `  Round #${round.id} — ${status}`
	}

	const soldTickets = round.actions.purchases.reduce(
		(sum, p) => sum + BigInt(p.ticketCount),
		0n,
	)
	const remainingTickets = round.config.ticketCap - Number(soldTickets)

	const expiresAt =
		new Date(round.startTime).getTime() +
		round.config.durationSeconds * 1000

	const remainingMs = expiresAt - Date.now()
	const remaining = Math.floor(remainingMs / 1000)

	return (
		`  Round #${round.id} — ${status}` +
		` | ${remainingTickets} tickets left` +
		` | ${toShortDurationFormat(remaining)} left`
	)
}

export class OngoingRoundsPage {
	static render(
		ongoingRounds: RoundDto[],
		availableStakes: AvailableStakeDto[],
	): PageContent {
		const stakeIds = [...new Set(availableStakes.map((s) => s.stake.id))]

		const lines: string[] = []

		for (const stakeId of stakeIds) {
			// empty string between stakes
			if (lines.length > 0) lines.push('')

			const stakeRounds = ongoingRounds.filter(
				(r) => r.stakeId === stakeId,
			)

			// stakeIds is set from availableStakes, thus stake is not undefined
			const stake = availableStakes.find((s) => s.stake.id === stakeId)!

			const config = resolveConfig(stake)

			lines.push(`${configName(config)} stake:`)

			const hasActiveRound = stakeRounds.some(
				(r) => r.status === 'FILLING',
			)

			if (!hasActiveRound) {
				lines.push('  Round ready — starts with your first purchase')
			}

			for (const round of stakeRounds) {
				lines.push(roundLine(round))
			}
		}

		return {
			message: lines.join('\n'),
			keyboard: addNav(new InlineKeyboard(), {
				home: actionIds.showHome,
				parent: actionIds.showStatus,
			}),
		}
	}
}
