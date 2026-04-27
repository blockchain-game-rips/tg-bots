import { InlineKeyboard } from 'grammy'
import { COMMAND_SEPARATOR } from '../../button-handler/utils'
import { PageContent } from '../../types'
import { actionIds } from '../action-ids'

export const ConfirmPage = {
	render(stakeId: number, ticketCount: number): PageContent {
		const keyboard = new InlineKeyboard()
			.text('Confirm', actionIds.showTestHome)
			.text(
				'Back',
				`${actionIds.showChooseTickets}${COMMAND_SEPARATOR}${stakeId}`,
			)

		return {
			message: `<b>Stake ${stakeId}</b>\n\nTickets: <b>${ticketCount}</b>\n\nConfirm purchase?`,
			keyboard,
		}
	},
}
