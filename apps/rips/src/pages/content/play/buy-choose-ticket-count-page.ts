import { InlineKeyboard } from 'grammy'
import { AvailableStakeDto } from '../../../../generated/api-client'
import { buildCommand } from '../../../button-handler/utils'
import { promptIds } from '../../../prompts/prompt-ids'
import { PageContent } from '../../../types'
import { pageIds } from '../../page-ids'
import { addNav, configName, getConfig } from '../../utils'

export class BuyChooseTicketCountPage {
	static render(availableStake: AvailableStakeDto): PageContent {
		const config = getConfig(availableStake)

		const keyboard = new InlineKeyboard()
			.text(
				'1 Ticket',
				buildCommand({
					type: 'open',
					pageId: pageIds.confirmPurchase,
					payloads: ['1'],
				}),
			)
			.row()
			.text(
				'3 Tickets',
				buildCommand({
					type: 'open',
					pageId: pageIds.confirmPurchase,
					payloads: ['3'],
				}),
			)
			.row()
			.text(
				'Custom Amount',
				buildCommand({
					promptId: promptIds.customTicketAmount,
					type: 'reply',
				}),
			)

		return {
			message: `Choose how many tickets to buy at ${configName(config)} each.`,
			keyboard: addNav(keyboard, {
				home: pageIds.home,
				parent: pageIds.chooseStake,
			}),
		}
	}
}
