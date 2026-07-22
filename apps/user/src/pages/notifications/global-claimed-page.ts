import { RipDto } from '@rips/api-client'
import { fmt, FormattedString, joinLines } from '@rips/grammy-kit'
import { configName } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'

export const GlobalClaimedRipPage = {
	render(rip: RipDto): PageContent {
		const preset = configName(rip.config)

		const lines = [
			fmt`🏆 ${FormattedString.b(`Rip #${rip.id.toString()} Finished!`)}`,
			'',
			`Preset: ${preset}`,
		]

		return {
			message: joinLines(lines),
			keyboard: new InlineKeyboard(),
		}
	},
}
