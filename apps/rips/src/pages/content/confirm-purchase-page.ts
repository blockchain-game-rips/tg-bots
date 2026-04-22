import { InlineKeyboard } from 'grammy'
import { AvailableStakeDto } from '../../../generated/api-client'
import { buildCommand } from '../../button-handler/utils'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { configName, getConfig } from '../utils'

export class ConfirmPurchasePage {
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
				.text(
					'Confirm',
					buildCommand({
						pageId: pageIds.successPurchase,
						type: 'open',
						payloads: [],
					}),
				)
				.row()
				.text(
					'Back',
					buildCommand({
						pageId: pageIds.chooseTicketAmount,
						type: 'open',
						payloads: [availableStake.stake.id.toString()],
					}),
				)
				.text(
					'Home',
					buildCommand({
						pageId: pageIds.home,
						type: 'open',
						payloads: [],
					}),
				),
		}
	}
}
