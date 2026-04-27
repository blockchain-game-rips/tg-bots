import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { actionIds } from '../action-ids'

const COMMAND_SEPARATOR = ':'

export const ChooseTicketsPage = {
	render(stakeId: number): PageContent {
		const keyboard = new InlineKeyboard()
			.text('5 tickets', `${actionIds.showConfirm}${COMMAND_SEPARATOR}5`)
			.text(
				'10 tickets',
				`${actionIds.showConfirm}${COMMAND_SEPARATOR}10`,
			)
			.row()
			.text('Custom count', actionIds.requestCustomCount)
			.row()
			.text('Back', actionIds.showTestHome)

		return {
			message: `<b>Stake ${stakeId}</b>\n\nChoose ticket count:`,
			keyboard,
		}
	},
}
