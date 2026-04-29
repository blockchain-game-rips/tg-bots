import { actionIds } from '../../actions'
import { KeyboardLayout, PageContent } from '../../types'
import { addNav, keyboardFromLayout } from '../../utils/keyboard'

export class PlayPage {
	static render(): PageContent {
		const buttons: KeyboardLayout = [
			[{ label: 'Buy tickets', actionId: actionIds.showChooseStake }],
			[{ label: 'Open Rips', actionId: actionIds.showOpenRips }],
			[{ label: 'Status', actionId: actionIds.showStatus }],
			[
				{
					label: 'Card Collection',
					actionId: actionIds.showCardChooseStake,
				},
			],
		]

		return {
			message:
				'Buy tickets to enter the game, or check your tickets and round statuses in Status.',
			keyboard: addNav(keyboardFromLayout(buttons), {
				home: actionIds.showHome,
				parent: actionIds.showHome,
			}),
		}
	}
}
