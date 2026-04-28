import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../../actions'
import { KeyboardLayout, PageContent } from '../../../types'
import { addNav, composeMarkup } from '../../utils'

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
			keyboard: addNav(new InlineKeyboard(composeMarkup(buttons)), {
				home: actionIds.showHome,
				parent: actionIds.showHome,
			}),
		}
	}
}
