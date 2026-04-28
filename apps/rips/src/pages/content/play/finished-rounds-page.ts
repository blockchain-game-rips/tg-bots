import { InlineKeyboard } from 'grammy'
import { RoundDto } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { displayStatus } from '../../round-statuses'
import { addNav, configName, messageFromLines } from '../../utils'

export class FinishedRoundsPage {
	static render(completedRounds: RoundDto[]): PageContent {
		const lines: string[] = []

		for (const round of completedRounds) {
			lines.push(
				`${configName(round.config)} stake | Round #${round.id} — ${displayStatus(round.status)}`,
			)
		}

		const message =
			lines.length > 0
				? messageFromLines(lines)
				: 'No completed rounds yet'

		return {
			message,
			keyboard: addNav(new InlineKeyboard(), {
				home: actionIds.showHome,
				parent: actionIds.showStatus,
			}),
		}
	}
}
