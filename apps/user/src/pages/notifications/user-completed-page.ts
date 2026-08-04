import { RipDto } from '@rips/api-client'
import {
	buildActionData,
	fmt,
	FormattedString,
	joinLines,
} from '@rips/grammy-kit'
import { configName } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

export const UserCompletedRipPage = {
	render(rip: RipDto): PageContent {
		const preset = configName(rip.config)

		const lines = [
			fmt`🏆 ${FormattedString.b(`Rip #${rip.id.toString()} is over — open your payouts!`)}`,
			'',
			`Preset: ${preset}`,
		]

		const keyboard = new InlineKeyboard().text(
			'Open Rips 🎁',
			buildActionData(actionIds.openOpenPullsNoBack, undefined),
		)

		return {
			message: joinLines(lines),
			keyboard,
		}
	},
}
