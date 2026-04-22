import { InlineKeyboard } from 'grammy'
import { RoundDto } from '../../../generated/api-client'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { addNav, configName } from '../utils'
import { displayStatus } from './round-statuses'

export class FinishedRoundsPage {
	static render(completedRounds: RoundDto[]): PageContent {
		const lines: string[] = []

		for (const round of completedRounds) {
			lines.push(
				`${configName(round.config)} stake | Round #${round.id} — ${displayStatus(round.status)}`,
			)
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
