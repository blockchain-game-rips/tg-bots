import { InlineKeyboard } from 'grammy'
import { Stake } from '../../api/schemas'
import { buildCommand } from '../../commands'
import { promptIds } from '../../prompts/prompt-ids'
import { PageContent } from '../../types'
import { pageIds } from '../page-ids'
import { addNav, readableStake } from '../utils'

export class ChooseTicketAmountPage {
	static render(stake: Stake): PageContent {
		const keyboard = new InlineKeyboard()
			.text(
				'1 Ticket',
				buildCommand({
					type: 'open',
					pageId: pageIds.confirmPurchase,
					payloads: ['1'],
				}),
			)
			.text(
				'3 Tickets',
				buildCommand({
					type: 'open',
					pageId: pageIds.confirmPurchase,
					payloads: ['3'],
				}),
			)
			.text(
				'Custom amount',
				buildCommand({
					promptId: promptIds.customTicketAmount,
					type: 'reply',
				}),
			)

		return {
			message: `Choose tickets amount for stake ${readableStake(stake)}`,
			keyboard: addNav(keyboard, {
				home: pageIds.home,
				parent: pageIds.chooseStake,
			}),
		}
	}
}
