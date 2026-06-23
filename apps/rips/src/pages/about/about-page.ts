import { ConfigDto } from '@rips/api-client'
import { addNav } from '@rips/grammy-kit'
import { configName, toShortDurationFormat } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

function renderConfig(config: ConfigDto): string {
	return [
		`🎮 <b>${configName(config)}</b>`,
		`⏱ Duration: ${toShortDurationFormat(config.durationSeconds)}`,
		`🎟 Entries per rip: ${config.entryCap.toString()}`,
	].join('\n')
}

export const AboutPage = {
	render(configs: ConfigDto[]): PageContent {
		const sections = configs.map((config) => renderConfig(config))

		const lines = [
			'<b>About the Game</b>',
			'',
			'Buy entries to enter a rip. When a rip fills up, payouts are distributed among participants.',
			'',
			'<b>Presets</b>',
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
