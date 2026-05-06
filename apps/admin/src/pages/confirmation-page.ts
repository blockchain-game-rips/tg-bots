import { actionIds } from '../actions'
import { PageContent } from '../types'
import { keyboardFromLayout } from '../utils/keyboard'

export class ConfirmationPage {
	static render(description: string): PageContent {
		const lines = ['<b>Confirm action</b>', '', description]
		return {
			message: lines.join('\n'),
			keyboard: keyboardFromLayout([
				[
					{
						label: 'Confirm',
						actionId: actionIds.executeConfirmPaused,
					},
					{ label: 'Cancel', actionId: actionIds.openHome },
				],
			]),
		}
	}
}
