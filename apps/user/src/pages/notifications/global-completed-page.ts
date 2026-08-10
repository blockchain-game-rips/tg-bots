import { RipDtoOutput } from '@rips/api-client'
import { fmt, FormattedString, joinLines } from '@rips/grammy-kit'
import { configName } from '@rips/shared'
import { PageContent } from '../../types'
import { playRipsKeyboard } from './play-rips-keyboard'

interface GlobalCompletedArgs {
	rip: RipDtoOutput
	playLink: string
}

export const GlobalCompletedRipPage = {
	render({ rip, playLink }: GlobalCompletedArgs): PageContent {
		const entryLevel = configName(rip.config)

		const lines = [
			fmt`🏆 ${FormattedString.b(`Rip #${rip.id.toString()} Completed!`)}`,
			'',
			`Entry level: ${entryLevel}`,
			'',
			'Open pulls and enter the next Rip.',
		]

		return {
			message: joinLines(lines),
			keyboard: playRipsKeyboard(playLink),
		}
	},
}
