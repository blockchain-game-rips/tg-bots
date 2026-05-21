import { actionIds } from '../actions'
import { ActionId, PageContent } from '../types'
import { keyboardFromLayout } from '../utils/keyboard'

export const ConfirmationPage = {
	render(description: string, confirmActionId: ActionId): PageContent {
		const lines = ['<b>Confirm action</b>', '', description]

		return {
			message: lines.join('\n'),
			keyboard: keyboardFromLayout([
				[
					{ label: 'Confirm', actionId: confirmActionId },
					{ label: 'Cancel', actionId: actionIds.openHome },
				],
			]),
		}
	},
}
