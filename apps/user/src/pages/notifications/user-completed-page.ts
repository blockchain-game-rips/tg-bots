import { RipDtoOutput } from '@rips/api-client'
import {
	buildActionData,
	fmt,
	FormattedString,
	joinLines,
} from '@rips/grammy-kit'
import { configName } from '@rips/shared'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../action-ids'
import { PageContent } from '../../types'
import * as labels from '../../utils/button-labels'

export const UserCompletedRipPage = {
	render(rip: RipDtoOutput): PageContent {
		const entryLevel = configName(rip.config)

		const lines = [
			fmt`🏆 ${FormattedString.b(`Rip #${rip.id.toString()} is over — open your pulls!`)}`,
			'',
			`Entry level: ${entryLevel}`,
		]

		const keyboard = new InlineKeyboard().text(
			labels.OPEN_PULLS,
			buildActionData(actionIds.openOpenPullsNoBack, undefined),
		)

		return {
			message: joinLines(lines),
			keyboard,
		}
	},
}
