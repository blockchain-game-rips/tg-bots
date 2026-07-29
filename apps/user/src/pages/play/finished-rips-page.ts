import { RipDto } from '@rips/api-client'
import { addNav, fmt, joinLines } from '@rips/grammy-kit'
import { configName, groupRipStatus } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

export const FinishedRipsPage = {
	render(completedRips: RipDto[]): PageContent {
		const lines: string[] = []

		for (const rip of completedRips) {
			lines.push(
				`${configName(rip.config)} preset | Rip #${rip.id.toString()} — ${groupRipStatus(rip.status)}`,
			)
		}

		const message =
			lines.length > 0 ? joinLines(lines) : fmt`No completed rips yet`

		return {
			message,
			keyboard: addNav(new InlineKeyboard(), {
				home: actionIds.openHome,
				parent: actionIds.openStatus,
			}),
		}
	},
}
