import { InlineKeyboard } from 'grammy'
import { AvailableStakeDto, RoundDto } from '../../../generated/api-client'
import { actionIds } from '../../grammy-kit/action/actions'
import { addNav } from '../../grammy-kit/keyboard/keyboard'
import { PageContent } from '../../types'
import { toShortDurationFormat } from '../../utils/duration'
import { displayStatus } from '../../utils/round-statuses'
import { configName, resolveConfig } from '../../utils/stake'

function roundLine(round: RoundDto): string {
	const status = displayStatus(round.status)

	if (round.status !== 'FILLING') {
		return `  Round #${round.id.toString()} — ${status}`
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
		`  Round #${round.id.toString()} — ${status}` +
		` | ${remainingTickets.toString()} tickets left` +
		` | ${toShortDurationFormat(remaining)} left`
	)
}

export const OngoingRoundsPage = {
	render(
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

			const stake = availableStakes.find((s) => s.stake.id === stakeId)
			if (stake === undefined)
				throw new Error(`Stake ${stakeId.toString()} not found`)

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
				home: actionIds.openHome,
				parent: actionIds.openStatus,
			}),
		}
	},
}
