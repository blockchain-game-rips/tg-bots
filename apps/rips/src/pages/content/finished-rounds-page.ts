import { InlineKeyboard } from 'grammy'
import { Round } from '../../api/schemas'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { addNav, readableStake } from '../utils'
import { FINISHED_STATUSES, displayStatus } from './round-statuses'

export class FinishedRoundsPage {
	static render(rounds: Round[]): PageContent {
		const finishedRounds = rounds.filter((r) =>
			FINISHED_STATUSES.includes(r.status),
		)

		const stakeIds = [...new Set(finishedRounds.map((r) => r.stake.id))]

		const lines: string[] = []

		for (const stakeId of stakeIds) {
			const stakeRounds = finishedRounds.filter(
				(r) => r.stake.id === stakeId,
			)

			if (lines.length > 0) lines.push('')

			lines.push(`${readableStake(stakeRounds[0].stake)} stake:`)

			for (const round of stakeRounds) {
				lines.push(
					`  Round #${round.id} — ${displayStatus(round.status)}`,
				)
			}
		}

		const message =
			lines.length > 0 ? lines.join('\n') : 'No completed rounds yet'

		return {
			message,
			keyboard: addNav(new InlineKeyboard(), {
				home: pageIds.home,
				parent: pageIds.status,
			}),
		}
	}
}
