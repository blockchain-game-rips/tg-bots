import { InlineKeyboard } from 'grammy'
import { PageContent } from '../../types'
import { actionIds } from '../action-ids'

const COMMAND_SEPARATOR = ':'

export const TestHomePage = {
	render(): PageContent {
		const keyboard = new InlineKeyboard()
			.text(
				'Stake 1',
				`${actionIds.showChooseTickets}${COMMAND_SEPARATOR}1`,
			)
			.text(
				'Stake 2',
				`${actionIds.showChooseTickets}${COMMAND_SEPARATOR}2`,
			)

		return {
			message: '<b>Test Home</b>\n\nChoose stake:',
			keyboard,
		}
	},
}
