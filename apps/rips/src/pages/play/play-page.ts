import { actionIds } from '../../actions'
import { KeyboardLayout, PageContent } from '../../types'
import { addNav, keyboardFromLayout } from '../../utils/keyboard'

export class PlayPage {
	static render(): PageContent {
		const buttons: KeyboardLayout = [
			[{ label: 'Buy tickets', actionId: actionIds.openChooseStake }],
			[{ label: 'Open Rips', actionId: actionIds.openOpenRips }],
			[{ label: 'Status', actionId: actionIds.openStatus }],
			[
				{
					label: 'Card Collection',
					actionId: actionIds.openCardChooseStake,
				},
			],
		]

		return {
			message:
				'Buy tickets to enter the game, or check your tickets and round statuses in Status.',
			keyboard: addNav(keyboardFromLayout(buttons), {
				home: actionIds.openHome,
				parent: actionIds.openHome,
			}),
		}
	}
}
