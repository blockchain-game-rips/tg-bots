import { InlineKeyboard } from 'grammy'
import { Round, RoundStatus } from '../../api/schemas'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { addNav } from '../utils'

const FINISHED_STATUSES: RoundStatus[] = ['CLAIMED', 'REFUNDED']

export class FinishedRoundsPage {
	static render(rounds: Round[]): PageContent {
		const finishedRounds = rounds.filter((r) =>
			FINISHED_STATUSES.includes(r.status),
		)

		const lines = finishedRounds.map(
			(r) => `Round #${r.id} (Stake #${r.stake.id}) — ${r.status}`,
		)

		const message =
			lines.length > 0 ? lines.join('\n') : 'No finished rounds'

		return {
			message,
			keyboard: addNav(new InlineKeyboard(), {
				home: pageIds.home,
				parent: pageIds.status,
			}),
		}
	}
}
