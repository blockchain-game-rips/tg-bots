import { InlineKeyboard } from 'grammy'
import { ConfigDto } from '../../../../generated/api-client'
import { PageContent } from '../../../types'
import { pageIds } from '../../page-ids'
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

		const message = sections.join('\n\n')

		return {
			message,
			keyboard: addNav(new InlineKeyboard(), {
				home: pageIds.home,
				parent: pageIds.home,
			}),
		}
	}
}
