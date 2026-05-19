import { addNav } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { ConfigDto } from '../../../generated/api-client'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { toShortDurationFormat } from '../../utils/format/duration'
import { configName } from '../../utils/stake'

function renderConfig(config: ConfigDto): string {
	return [
		`🎮 <b>${configName(config)}</b>`,
		`⏱ Duration: ${toShortDurationFormat(config.durationSeconds)}`,
		`🎟 Tickets per round: ${config.ticketCap.toString()}`,
	].join('\n')
}

export const AboutPage = {
	render(configs: ConfigDto[]): PageContent {
		const sections = configs.map((config) => renderConfig(config))

		const lines = [
			'<b>About the Game</b>',
			'',
			'Buy tickets to enter a round. When a round fills up, prizes are distributed among participants.',
			'',
			'<b>Stakes</b>',
			'',
			sections.join('\n\n'),
		]

		return {
			message: lines.join('\n'),
			keyboard: addNav(new InlineKeyboard(), {
				home: actionIds.openHome,
				parent: actionIds.openHome,
			}),
		}
	},
}
