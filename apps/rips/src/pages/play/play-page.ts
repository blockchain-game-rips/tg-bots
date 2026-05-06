import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'
import { buildActionData } from '../../utils/action-data'
import { addNav } from '../../utils/keyboard'

export class PlayPage {
	static render(): PageContent {
		const lines = [
			'<b>Play</b>',
			'',
			'Buy tickets to enter a round, open your prize Rips, or check your round status.',
		]

		const keyboard = new InlineKeyboard()
			.text(
				'Buy Tickets',
				buildActionData(actionIds.openChooseStake, undefined),
			)
			.row()
			.text(
				'Open Rips',
				buildActionData(actionIds.openOpenRips, undefined),
			)
			.row()
			.text('Status', buildActionData(actionIds.openStatus, undefined))
			.row()
			.text(
				'Card Collection',
				buildActionData(actionIds.openCardChooseStake, undefined),
			)
			.row()

		addNav(keyboard, {
			home: actionIds.openHome,
			parent: actionIds.openHome,
		})

		return { message: lines.join('\n'), keyboard }
	}
}
