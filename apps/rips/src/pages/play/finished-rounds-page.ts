import { RoundDto } from '@rips/api-client'
import { addNav } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { displayStatus } from '../../utils/round-statuses'
import { configName } from '../../utils/stake'

export const FinishedRoundsPage = {
	render(completedRounds: RoundDto[]): PageContent {
		const lines: string[] = []

		for (const round of completedRounds) {
			lines.push(
				`${configName(round.config)} stake | Round #${round.id.toString()} — ${displayStatus(round.status)}`,
			)
		}

		const message =
			lines.length > 0 ? lines.join('\n') : 'No completed rounds yet'

		return {
			message,
			keyboard: addNav(new InlineKeyboard(), {
				home: actionIds.openHome,
				parent: actionIds.openStatus,
			}),
		}
	},
}
