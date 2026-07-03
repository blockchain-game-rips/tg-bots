import { addNav, buildActionData } from '@rips/grammy-kit'
import { InlineKeyboard } from 'grammy'
import { actionIds } from '../../actions'
import { PageContent } from '../../types'

export const PlayPage = {
	render(): PageContent {
		const lines = [
			'<b>Play</b>',
			'',
			'Buy entries to enter a rip, open your payout Rips, or check your rip status.',
		]

		const keyboard = new InlineKeyboard()
			.text(
				'Buy Entries',
				buildActionData(actionIds.openChoosePreset, undefined),
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
				buildActionData(actionIds.openCardCollection, undefined),
			)
			.row()

		addNav(keyboard, {
			home: actionIds.openHome,
			parent: actionIds.openHome,
		})

		return { message: lines.join('\n'), keyboard }
	},
}
