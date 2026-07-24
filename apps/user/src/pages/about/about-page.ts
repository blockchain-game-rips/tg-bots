import { ConfigDto } from '@rips/api-client'
import { addNav, fmt, FormattedString, joinLines } from '@rips/grammy-kit'
import { configName, toShortDurationFormat } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

function renderConfig(config: ConfigDto): FormattedString {
	return joinLines([
		fmt`🎮 ${FormattedString.b(configName(config))}`,
		`⏱ Duration: ${toShortDurationFormat(config.durationSeconds)}`,
		`🎟 Entries per rip: ${config.entryCap.toString()}`,
	])
}

export const AboutPage = {
	render(configs: ConfigDto[]): PageContent {
		const sections = configs.map((config) => renderConfig(config))

		const lines = [
			FormattedString.b('About the Game'),
			'',
			'Enter a rip to take part. When a rip fills up, payouts are distributed among participants.',
			'',
			FormattedString.b('Presets'),
			'',
			FormattedString.join(sections, '\n\n'),
		]

		return {
			message: joinLines(lines),
			keyboard: addNav(new InlineKeyboard(), {
				home: actionIds.openHome,
				parent: actionIds.openHome,
			}),
		}
	},
}
