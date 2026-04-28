import { InlineKeyboard } from 'grammy'
import { ConfigDto } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { toShortDurationFormat } from '../../ui-utils'
import { addNav, configName } from '../../utils'

function renderConfig(config: ConfigDto): string {
	return [
		`<b>${configName(config)} stake</b>`,
		`Duration: ${toShortDurationFormat(config.durationSeconds)}`,
		`Tickets per round: ${config.ticketCap}`,
	].join('\n')
}

export class AboutPage {
	static render(configs: ConfigDto[]): PageContent {
		const sections = configs.map((config) => renderConfig(config))

		const message =
			'*Detailed description of the game*\n\nStakes:\n\n' +
			sections.join('\n\n')

		return {
			message,
			keyboard: addNav(new InlineKeyboard(), {
				home: actionIds.showHome,
				parent: actionIds.showHome,
			}),
		}
	}
}
