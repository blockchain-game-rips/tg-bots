import { RipDtoOutput } from '@rips/api-client'
import { fmt, FormattedString, joinLines } from '@rips/grammy-kit'
import { configName } from '@rips/shared'
import { PageContent } from '../../types'
import { playRipsKeyboard } from './play-rips-keyboard'

interface GlobalRefundedArgs {
	rip: RipDtoOutput
	playLink: string
}

export const GlobalRefundedRipPage = {
	render({ rip, playLink }: GlobalRefundedArgs): PageContent {
		const entryLevel = configName(rip.config)

		const lines = [
			fmt`↩️ ${FormattedString.b(`Rip #${rip.id.toString()} Refunded`)}`,
			'',
			`Entry level: ${entryLevel}`,
			'',
			"It didn't fill in time, so entries went back. A new Rip is filling now.",
		]

		return {
			message: joinLines(lines),
			keyboard: playRipsKeyboard(playLink),
		}
	},
}
