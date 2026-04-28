import { InlineKeyboard } from 'grammy'
import { AvailableStakeDto } from '../../../../generated/api-client'
import { actionIds } from '../../../actions'
import { PageContent } from '../../../types'
import { buildActionData, configName, getConfig } from '../../utils'

export class BuyConfirmPage {
	static render(
		availableStake: AvailableStakeDto,
		ticketCount: number,
	): PageContent {
		const config = getConfig(availableStake)

		const lines = [
			`${configName(config)} stake`,
			`Ticket count: ${ticketCount}`,
			'',
			'Confirm to proceed',
		]

		const message = lines.join('\n')

		return {
			message,
			keyboard: new InlineKeyboard()
				.text('Confirm', actionIds.buyTickets)
				.row()
				.text(
					'Back',
					buildActionData(
						actionIds.showChooseTicketAmount,
						availableStake.stake.id.toString(),
					),
				)
				.text('Home', actionIds.showHome),
		}
	}
}
