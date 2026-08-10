import { RipDtoOutput } from '@rips/api-client'
import { fmt, FormattedString, joinLines } from '@rips/grammy-kit'
import { configName } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'

export const GlobalRefundedRipPage = {
	render(rip: RipDtoOutput): PageContent {
		const entryLevel = configName(rip.config)

		const lines = [
			fmt`↩️ ${FormattedString.b(`Rip #${rip.id.toString()} Refunded`)}`,
			'',
			`Entry level: ${entryLevel}`,
		]

		return {
			message: joinLines(lines),
			keyboard: new InlineKeyboard(),
		}
	},
}
