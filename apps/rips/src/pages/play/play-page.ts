import { actionIds } from '../../actions'
import { KeyboardLayout, PageContent } from '../../types'
import { addNav, keyboardFromLayout } from '../../utils/keyboard'

export class PlayPage {
	static render(): PageContent {
		const buttons: KeyboardLayout = [
			[{ label: 'Buy Tickets', actionId: actionIds.openChooseStake }],
			[{ label: 'Open Rips', actionId: actionIds.openOpenRips }],
			[{ label: 'Status', actionId: actionIds.openStatus }],
			[
				{
					label: 'Card Collection',
					actionId: actionIds.openCardChooseStake,
				},
			],
		]

		const lines = [
			'<b>Play</b>',
			'',
			'Buy tickets to enter a round, open your prize Rips, or check your round status.',
		]

		return {
			message: lines.join('\n'),
			keyboard: addNav(keyboardFromLayout(buttons), {
				home: actionIds.openHome,
				parent: actionIds.openHome,
			}),
		}
	}
}
