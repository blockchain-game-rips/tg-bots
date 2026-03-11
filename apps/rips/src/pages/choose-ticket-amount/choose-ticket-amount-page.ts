import { InlineKeyboard } from 'grammy'
import { buildCommand } from '../../commands'
import { promptIds } from '../../prompts/prompt-ids'
import { PageContent } from '../interfaces'
import { pageIds } from '../page-ids'
import { addNav } from '../utils.ts/utils'

type Stake = { stakeId: number; ticketPrice: number }

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
			message: `Choose tickets amount for stake ${stake.ticketPrice} ETH`,
			keyboard: addNav(keyboard, {
				home: pageIds.home,
				parent: pageIds.chooseStake,
			}),
		}
	}
}
