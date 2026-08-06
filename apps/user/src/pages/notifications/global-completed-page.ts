import { RipDtoOutput } from '@rips/api-client'
import { fmt, FormattedString, joinLines } from '@rips/grammy-kit'
import { configName } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'

export const GlobalCompletedRipPage = {
	render(rip: RipDtoOutput): PageContent {
		const preset = configName(rip.config)

		const lines = [
			fmt`🏆 ${FormattedString.b(`Rip #${rip.id.toString()} Completed!`)}`,
			'',
			`Preset: ${preset}`,
		]

		return {
			message: joinLines(lines),
			keyboard: new InlineKeyboard(),
		}
	},
}
