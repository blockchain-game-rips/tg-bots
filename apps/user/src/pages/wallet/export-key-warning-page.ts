import { buildActionData, joinLines, Line } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../action-ids'
import { PageContent } from '../../types'
import * as labels from '../../utils/button-labels'

export const ExportKeyWarningPage = {
	render(): PageContent {
		const lines: Line[] = [
			'⚠️ Anyone with this private key can control this wallet.',
			'',
			'Never share it with anyone.',
			'Rips support will never ask for your private key.',
			'Store it somewhere safe.',
		]

		const keyboard = new InlineKeyboard()
			.text(
				labels.SHOW_PRIVATE_KEY,
				buildActionData(actionIds.openExportKey, undefined),
			)
			.row()

		keyboard.appendNavButtons()

		return { message: joinLines(lines), keyboard }
	},
}
