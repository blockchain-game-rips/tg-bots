import { InlineKeyboard } from 'grammy'
import { buildActionData } from '../../grammy-kit/action/action-data'
import { actionIds } from '../../grammy-kit/action/actions'
import { addNav } from '../../grammy-kit/keyboard/keyboard'
import { PageContent } from '../../types'

export const PlayPage = {
	render(): PageContent {
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
	},
}
