import { FormattedString, joinLines, Line } from '@rips/grammy-kit'
import { actionIds } from '../action-ids'
import { ActionId, PageContent } from '../types'
import { keyboardFromLayout } from '../utils/keyboard'

export const ConfirmationPage = {
	render(
		description: string | FormattedString,
		confirmActionId: ActionId,
	): PageContent {
		const lines: Line[] = [
			FormattedString.b('Confirm action'),
			'',
			description,
		]

		return {
			message: joinLines(lines),
			keyboard: keyboardFromLayout([
				[
					{ label: 'Confirm', actionId: confirmActionId },
					{ label: 'Cancel', actionId: actionIds.openHome },
				],
			]),
		}
	},
}
